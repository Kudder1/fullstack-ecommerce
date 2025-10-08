const ApiError = require("../error/ApiError")
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models/models');

const generateJwt = (id, email, role) => {
    return jwt.sign(
        { id, email, role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    )
}

class UserController {
    async registration(req, res, next) {
        const { email, password, role } = req.body
        if (!email || !password) {
            return next(ApiError.badRequest('Email or password are incorrect'))
        }
        const candidate = await User.findOne({ where: { email } })
        if (candidate) {
            return next(ApiError.badRequest('User with this email already exists'))
        }
        const hashPassword = await bcrypt.hash(password, 5)
        const user = await User.create({ email, password: hashPassword, role })
        const token = generateJwt(user.id, user.email, user.role)
        return res.json({ token })
    }
    async login(req, res, next) {
        const { email, password } = req.body
        const user = await User.findOne({ where: { email } })
        if (!user) {
            return next(ApiError.badRequest('User not found'))
        }
        const comparePassword = bcrypt.compareSync(password, user.password)
        if (!comparePassword) {
            return next(ApiError.badRequest('Invalid password'))
        }
        const token = generateJwt(user.id, user.email, user.role)
        return res.json({ token })
    }
    async checkAuth(req, res, next) {
        // if user constantly uses his account, his token will be rewritten
        const token = generateJwt(req.user.id, req.user.email, req.user.role)
        return res.json({ token })
    }
}

module.exports = new UserController()