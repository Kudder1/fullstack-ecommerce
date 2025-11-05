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
    async add(req, res) {
        const { id: userId } = req.user
        const { deviceId, quantity } = req.body

        try {
            const [basket] = await Basket.findOrCreate({
                where: { userId },
                defaults: { userId }
            })

            await BasketDevice.upsert({
                basketId: basket.id,
                deviceId,
                quantity: sequelize.literal(`COALESCE("quantity", 0) + ${quantity}`)
            })
            // alternative: simple increment (no COALESCE needed if column is NOT NULL)
            // quantity column has a default or is never NULL.

            const fullBasket = await BasketDevice.findAll({
                where: { basketId: basket.id },
                include: [{ model: Device, include: [{ model: Brand }] }]
            })

            return res.json(getBasketTotals(fullBasket))
        } catch (e) {
            console.error('Add to cart error:', e)
            return res.status(500).json({ error: 'Failed to add item' })
        }
    }
    async update(req, res) {
        const { id: userId } = req.user
        const { deviceId, quantity } = req.body

        try {
            const basket = await Basket.findOne({ where: { userId } })
            
            if (quantity <= 0) {
                await BasketDevice.destroy({
                    where: { basketId: basket.id, deviceId }
                })
            } else {
                await BasketDevice.upsert({
                    basketId: basket.id,
                    deviceId,
                    quantity
                })
            }

            const fullBasket = await BasketDevice.findAll({
                where: { basketId: basket.id },
                include: [{ model: Device, include: [{ model: Brand }] }]
            })

            return res.json(getBasketTotals(fullBasket))
        } catch (e) {
            console.error('Update cart error:', e)
            return res.status(500).json({ error: 'Failed to update item' })
        }
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