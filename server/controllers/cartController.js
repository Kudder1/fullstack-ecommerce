const ApiError = require("../error/ApiError")
const { Basket, BasketDevice, Device, Brand } = require("../models/models")
const crypto = require("crypto")
const sequelize = require("../db")

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
            const startTime = Date.now()
            
            const [basket] = await Basket.findOrCreate({
                where: { userId },
                defaults: { userId }
            })
            console.log(`Basket findOrCreate: ${Date.now() - startTime}ms`)

            const upsertStart = Date.now()
            await sequelize.query(
                `INSERT INTO basket_devices ("basketId", "deviceId", quantity, "createdAt", "updatedAt") 
                 VALUES (:basketId, :deviceId, :quantity, NOW(), NOW())
                 ON CONFLICT ("basketId", "deviceId") 
                 DO UPDATE SET quantity = basket_devices.quantity + :quantity, "updatedAt" = NOW()`,
                {
                    replacements: { basketId: basket.id, deviceId, quantity }
                }
            )
            console.log(`Upsert: ${Date.now() - upsertStart}ms`)

            const fetchStart = Date.now()
            const fullBasket = await BasketDevice.findAll({
                where: { basketId: basket.id },
                include: [{ model: Device, include: [{ model: Brand }] }]
            })
            console.log(`Fetch full basket: ${Date.now() - fetchStart}ms`)
            console.log(`Total add to cart time: ${Date.now() - startTime}ms`)

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
                await sequelize.query(
                    `INSERT INTO basket_devices ("basketId", "deviceId", quantity, "createdAt", "updatedAt") 
                     VALUES (:basketId, :deviceId, :quantity, NOW(), NOW())
                     ON CONFLICT ("basketId", "deviceId") 
                     DO UPDATE SET quantity = :quantity, "updatedAt" = NOW()`,
                    {
                        replacements: { basketId: basket.id, deviceId, quantity }
                    }
                )
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