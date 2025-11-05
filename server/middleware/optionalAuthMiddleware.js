const jwt = require('jsonwebtoken')
const ApiError = require('../error/ApiError')

module.exports = function (req, res, next) {
    if (req.method === 'OPTIONS') {
        next()
    }
    try {
        const token = req.headers.authorization?.split(' ')[1]
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET)
            req.user = decoded   
        }
        next()
    } catch {
        return next(ApiError.badRequest('Invalid token'))
    }
}