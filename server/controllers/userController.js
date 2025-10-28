const crypto = require('crypto')
const ApiError = require("../error/ApiError")
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models/models');
const { sendEmail } = require('../email');
const { OAuth2Client } = require("google-auth-library");
const { getUrl } = require('../utils');
const { runAllServices } = require('../services');

const generateJwt = (id, email, role, emailVerified) => {
    return jwt.sign(
        { id, email, role, emailVerified },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    )
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
        const token = generateJwt(user.id, user.email, user.role, user.emailVerified)

        await sendEmail(user.email, verificationId, 'verifyEmail')

        await runAllServices(questBasket, req.cookies.guestToken, user)

        return res.json({ token })
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

        const token = generateJwt(user.id, user.email, user.role, user.emailVerified)
        return res.json({ token })
    }

    async loginWithGoogle(req, res, next) {
        const { code, questBasket } = req.body
        try {
            const { tokens } = await client.getToken(code)
            // tokens = { access_token, id_token, refresh_token, ... }
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

            const token = generateJwt(user.id, user.email, user.role, user.emailVerified)

            await runAllServices(questBasket, req.cookies.guestToken, user)

            return res.json({ token })
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
        const token = generateJwt(user.id, user.email, user.role, user.emailVerified)
        return res.json({ token, message: 'Password successfully updated' })
    }
    async checkAuth(req, res) {
        // if user constantly uses his account, his token will be rewritten
        const token = generateJwt(req.user.id, req.user.email, req.user.role, req.user.emailVerified)
        // any other data should be fetched from a separate getUser endpoint
        return res.json({ token })
    }
}

module.exports = new UserController()