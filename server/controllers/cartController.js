const ApiError = require("../error/ApiError")
const { Basket, BasketDevice, Device, Brand, Order, OrderItem } = require("../models/models")
const Stripe = require("stripe")
const { getUrl } = require("../utils")
const sequelize = require("../db")
const crypto = require("crypto")

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

async function mergeBaskets(dbBasketRaw, questCart, dbBasketId) {
    const dbBasket = dbBasketRaw.toJSON()
    if (!dbBasket.basket_devices?.length) {
        const createPromises = questCart.basket.map(item => 
            BasketDevice.create({
                basketId: dbBasketId, 
                deviceId: item.device.id, 
                quantity: item.quantity 
            })
        )
        await Promise.all(createPromises)
    } else {
        const dbDevicesMap = new Map()
        dbBasket.basket_devices.forEach(device => {
            dbDevicesMap.set(device.deviceId, device)
        })
        const createPromises = []
        questCart.basket.forEach(item => {
            if (dbDevicesMap.has(item.deviceId)) {
                createPromises.push(
                    BasketDevice.update(
                        // { quantity: sequelize.literal('quantity + ' + item.quantity) }, // This creates SQL: quantity = quantity + 5
                        { quantity: item.quantity },
                        { where: { basketId: dbBasketId, deviceId: item.deviceId } }
                    )
                )
            } else {
                createPromises.push(
                    BasketDevice.create({
                        basketId: dbBasketId, 
                        deviceId: item.device.id, 
                        quantity: item.quantity 
                    })
                )
            }
        })
        await Promise.all(createPromises)
    }
}

function getBasketTotals(basket) {
    const deviceCount = basket.length
    const totalItems = basket.reduce((acc, item) => acc + item.quantity, 0)
    const totalPrice = basket.reduce((acc, item) => acc + item.device.price * item.quantity, 0)
    return { basket, deviceCount, totalItems, totalPrice }
}

class CartController {
    async create(req, res) {
        const { questBasket } = req.body
        const { id: userId } = req.user
        let basket = await Basket.findOne({ where: { userId }, include: [{ model: BasketDevice }] })
        if (questBasket) {
            if (!basket) {
                basket = await Basket.create({ userId })
            }
            await mergeBaskets(basket, questBasket, basket.id)
            return res.json(basket)
        }
        if (!basket) {
            basket = await Basket.create({ userId })
        }
        return res.json(basket)
    } 
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
    async checkout(req, res, next) {
        const { id: userId } = req.user || {}
        const { items: itemsWithIdAndQuantity } = req.body
        try {
            const devices = await Device.findAll({
                where: {
                    id: itemsWithIdAndQuantity.map(item => item.id),
                },
                raw: true
            })
            const quantityMap = new Map(
                itemsWithIdAndQuantity.map(item => [item.id, item.quantity])
            )
            const lineItems = devices.map(device => ({
                price_data: {
                    currency: 'usd',
                    product_data: { name: device.name },
                    unit_amount: device.price * 100,
                },
                quantity: quantityMap.get(device.id),
            }))
            const session = await stripe.checkout.sessions.create({
                mode: 'payment',
                payment_method_types: ['card'],
                line_items: lineItems,
                shipping_address_collection: {
                    allowed_countries: ['UA'],
                },
                success_url: `${getUrl()}/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${getUrl()}/`,
                expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 minutes from now
            })

            const order = await Order.create({
                stripeSessionId: session.id,
                amount: session.amount_total,
                currency: session.currency,
                userId: userId || null,
                guestToken: userId ? null : req.cookies.guestToken,
            })

            const orderItemsData = devices.map(device => ({
                orderId: order.id,
                deviceId: device.id,
                name: device.name,
                price: device.price * 100,
                quantity: quantityMap.get(device.id)
            }))

            const t = await sequelize.transaction()
            try {
                await OrderItem.bulkCreate(orderItemsData, {
                    transaction: t,
                    ignoreDuplicates: true,
                    validate: true
                })
                await t.commit()
            } catch (err) {
                await t.rollback()
                console.log('Transaction rolled back due to error:', err)
                return next(ApiError.internal('Checkout error: ' + err.message))
            }
            return res.json({ url: session.url })
        } catch (error) {
            return next(ApiError.internal('Checkout error: ' + error.message))
        }
    }
    async verifyCheckoutSession(req, res, next) {
        const { sessionId } = req.query
        if (!sessionId) {
            return next(ApiError.badRequest('Missing sessionId'))
        }
        try {
            const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ["line_items"] })
            if (session.payment_status !== "paid") {
                return next(ApiError.badRequest('Payment not completed'))
            }
            const items = session.line_items.data.map((li) => ({
                name: li.description,
                quantity: li.quantity,
                amount: li.price.unit_amount,
            }))
            return res.json({ items })
        } catch (error) {
            return next(ApiError.badRequest('Checkout session verification error: ' + error.message))
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