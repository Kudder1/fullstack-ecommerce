const crypto = require('crypto')
const ApiError = require("../error/ApiError")
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models/models');
const { sendEmail } = require('../email');
const { OAuth2Client } = require("google-auth-library");
const { getUrl } = require('../utils');
const { runAllServices } = require('../services');

const generateAccessToken = (id, email, role, emailVerified) => {
    return jwt.sign(
        { id, email, role, emailVerified },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: '15m' }
    )
}
const generateRefreshToken = (id) => {
    return jwt.sign(
        { id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
    )
}
const refreshTokenCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    sameSite: 'strict', // lax
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
}

const generateVerificationId = () => {
    const verificationId = crypto.randomBytes(32).toString('base64url');
    const verificationIdExpireDate = Date.now() + 1000 * 60 * 10; // +10 minutes
    return { verificationId, verificationIdExpireDate }
}

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  getUrl()
);

class UserController {
    async registration(req, res, next) {
        const { email, password, role, questBasket } = req.body
        if (!email || !password) {
            return next(ApiError.badRequest('Email or password are incorrect'))
        }
        const candidate = await User.findOne({ where: { email } })
        if (candidate) {
            return next(ApiError.badRequest('User with this email already exists'))
        }
        const hashPassword = await bcrypt.hash(password, 5)

        const { verificationId, verificationIdExpireDate } = generateVerificationId()

        const user = await User.create({ email, password: hashPassword, role, emailVerificationId: verificationId, emailVerificationIdExpireDate: verificationIdExpireDate })
        const accessToken = generateAccessToken(user.id, user.email, user.role, user.emailVerified)
        const refreshToken = generateRefreshToken(user.id)
        res.cookie('refreshToken', refreshToken, refreshTokenCookieOptions)

        await sendEmail(user.email, verificationId, 'verifyEmail')
        await runAllServices(questBasket, req.cookies.guestToken, user)

        return res.json({ accessToken })
    }
    async verifyEmail(req, res, next) {
        const { token } = req.query
        const user = await User.findOne({ where: { emailVerificationId: token } })
        if (!user) {
            return next(ApiError.badRequest('Invalid verification link'))
        }
        if (user.emailVerificationIdExpireDate < Date.now()) {
            return next(ApiError.badRequest('Verification link has expired'))
        }
        user.emailVerified = true
        user.emailVerificationId = null
        user.emailVerificationIdExpireDate = null
        await user.save()
        return res.json({ message: 'Email successfully verified' })
    }
    async reverifyEmail(req, res) {
        const { id, email } = req.user
        const user = await User.findOne({ where: { id } })
        const { verificationId, verificationIdExpireDate } = generateVerificationId()
        user.emailVerificationId = verificationId
        user.emailVerificationIdExpireDate = verificationIdExpireDate
        await user.save()
        await sendEmail(email, verificationId, 'verifyEmail')
        return res.json({ message: 'Email verification email has been sent' })
    }
    async login(req, res, next) {
        const { email, password, questBasket } = req.body
        const user = await User.findOne({ where: { email } })
        if (!user) {
            return next(ApiError.badRequest('Invalid email or password'))
        }
        if (!user.password && user.googleId) {
            return next(ApiError.badRequest('Please log in using Google OAuth'))
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return next(ApiError.badRequest('Invalid email or password'))
        }

        await runAllServices(questBasket, req.cookies.guestToken, user)

        const accessToken = generateAccessToken(user.id, user.email, user.role, user.emailVerified)
        const refreshToken = generateRefreshToken(user.id)
        res.cookie('refreshToken', refreshToken, refreshTokenCookieOptions)

        return res.json({ accessToken })
    }
    async loginWithGoogle(req, res, next) {
        const { code, questBasket } = req.body
        try {
            const { tokens } = await client.getToken(code)
            const ticket = await client.verifyIdToken({
                idToken: tokens.id_token,
                audience: process.env.GOOGLE_CLIENT_ID,
            })
            const payload = ticket.getPayload()
            const { email, sub } = payload
            const [user] = await User.findOrCreate({
                where: { email },
                defaults: { email, emailVerified: true }
            })
            user.googleId = sub
            await user.save()

            await runAllServices(questBasket, req.cookies.guestToken, user)

            const accessToken = generateAccessToken(user.id, user.email, user.role, user.emailVerified)
            const refreshToken = generateRefreshToken(user.id)
            res.cookie('refreshToken', refreshToken, refreshTokenCookieOptions)

            return res.json({ accessToken })
        } catch (error) {
            console.error(error)
            next(ApiError.internal('Google authentication failed'))
        }
    }
    async recoverPassword(req, res) {
        const { email } = req.body
        const user = await User.findOne({ where: { email } })
        if (user) {
            const { verificationId, verificationIdExpireDate } = generateVerificationId()
            user.passwordResetId = verificationId
            user.passwordResetIdExpireDate = verificationIdExpireDate
            await user.save()
            await sendEmail(email, verificationId, 'resetPassword')
        }
        return res.json({ message: 'If that email is registered, you will receive a password reset link shortly' })
    }
    async newPassword(req, res, next) {
        const { password1, password2 } = req.body
        const { token: passwordResetId } = req.query
        if (!passwordResetId) {
            return next(ApiError.badRequest('Invalid token1'))
        }
        if (password1 !== password2) {
            return next(ApiError.badRequest('Passwords do not match'))
        }
        const user = await User.findOne({ where: { passwordResetId } })
        if (!user) {
            return next(ApiError.badRequest('Invalid token2'))
        }
        if (user.passwordResetIdExpireDate < Date.now()) {
            return next(ApiError.badRequest('Token has expired'))
        }
        user.password = await bcrypt.hash(password1, 5)
        user.passwordResetId = null
        user.passwordResetIdExpireDate = null
        await user.save()

        const accessToken = generateAccessToken(user.id, user.email, user.role, user.emailVerified)
        const refreshToken = generateRefreshToken(user.id)
        res.cookie('refreshToken', refreshToken, refreshTokenCookieOptions)

        return res.json({ accessToken, message: 'Password successfully updated' })
    }
    async refreshAccessToken(req, res, next) {
        const { refreshToken } = req.cookies
        if (!refreshToken) {
            return next(ApiError.unauthorized())
        }
        let userData
        try {
            userData = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
        } catch {
            return next(ApiError.unauthorized())
        }
        const user = await User.findOne({ where: { id: userData.id } })
        if (!user) {
            return next(ApiError.unauthorized())
        }
        const accessToken = generateAccessToken(user.id, user.email, user.role, user.emailVerified)
        return res.json({ accessToken })
    }
    async logout(r, res) {
        res.clearCookie('refreshToken', refreshTokenCookieOptions)
        return res.json({ message: 'Successfully logged out' })
    }
}

module.exports = new UserController()