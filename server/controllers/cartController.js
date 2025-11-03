const ApiError = require("../error/ApiError")
const { Basket, BasketDevice, Device, Brand } = require("../models/models")
const crypto = require("crypto")

function getBasketTotals(basket) {
    const deviceCount = basket.length
    const totalItems = basket.reduce((acc, item) => acc + item.quantity, 0)
    const totalPrice = basket.reduce((acc, item) => acc + item.device.price * item.quantity, 0)
    return { basket, deviceCount, totalItems, totalPrice }
}

class CartController {
    async get(req, res) {
        const { id: userId } = req.user
        const basket = await Basket.findOne({
            where: { userId },
            include: [{
                model: BasketDevice,
                include: [{
                    model: Device,
                    include: [{
                        model: Brand
                    }]
                }]
            }]
        })
        const basketDevices = basket ? basket.basket_devices : []
        return res.json(getBasketTotals(basketDevices))
    }
    async add(req, res, next) {
        const { id: userId } = req.user
        const { deviceId, quantity } = req.body

        let device = await Device.findOne({ where: { id: deviceId } })
        if (!device) {
            return next(ApiError.notFound('Device not found'))
        }

        let basket = await Basket.findOne({ where: { userId } })
        if (!basket) {
            basket = await Basket.create({ userId })
        }

        let basketDevice = await BasketDevice.findOne({ where: { basketId: basket.id, deviceId } })
        if (!basketDevice) {
            basketDevice = await BasketDevice.create({ basketId: basket.id, deviceId, quantity })
        } else {
            basketDevice.quantity += quantity
            await basketDevice.save()
        }
        
        const fullBasket = await BasketDevice.findAll({ where: { basketId: basket.id }, include: [{ model: Device }] })
        return res.json(getBasketTotals(fullBasket))
    }
    async update(req, res) {
        const { id: userId } = req.user
        const { deviceId, quantity } = req.body

        let device = await Device.findOne({ where: { id: deviceId } })
        if (!device) {
            return next(ApiError.notFound('Device not found'))
        }

        const basket = await Basket.findOne({ where: { userId } })
        const basketDevice = await BasketDevice.findOne({ where: { basketId: basket.id, deviceId } })

        if (quantity <= 0) {
            await basketDevice.destroy()
        } else {
            basketDevice.quantity = quantity
            await basketDevice.save()
        }

        const fullBasket = await BasketDevice.findAll({ where: { basketId: basket.id }, include: [{ model: Device }] })
        return res.json(getBasketTotals(fullBasket))
    }
    async generateGuestToken(req, res) {
        const guestToken = req.cookies.guestToken
        if (!guestToken) {
            res.cookie('guestToken', crypto.randomBytes(16).toString('hex'), {
                httpOnly: true,
                secure: process.env.NODE_ENV !== 'development',
                sameSite: 'lax',
                maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
            })
        }
        return res.json({ success: true })  
    }
}

module.exports = new CartController()