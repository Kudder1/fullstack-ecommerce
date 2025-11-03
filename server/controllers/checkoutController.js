const ApiError = require("../error/ApiError")
const { Device, Order, OrderItem } = require("../models/models")
const Stripe = require("stripe")
const { getUrl, generatePaypalAccessToken } = require("../utils")
const sequelize = require("../db")

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
const currencyCode = 'USD'

const prepareLineItems = async (itemsWithIdAndQuantity, checkoutMethod) => {
    const devices = await Device.findAll({
        where: { id: itemsWithIdAndQuantity.map(item => item.id) },
        raw: true
    })
    const quantityMap = new Map(itemsWithIdAndQuantity.map(item => [item.id, item.quantity]))

    let totalAmount = 0

    const lineItems = devices.map(device => {
        totalAmount += device.price * quantityMap.get(device.id)
        return {
            ...(checkoutMethod === 'stripe' ? {
                price_data: {
                    currency: currencyCode.toLowerCase(),
                    product_data: { name: device.name },
                    unit_amount: device.price * 100,
                },
            } : {
                name: device.name,
                unit_amount: {
                    currency_code: currencyCode,
                    value: device.price.toFixed(2),
                },
            }),
            quantity: quantityMap.get(device.id),
        }
    })
    return { lineItems, devices, quantityMap, totalAmount }
}
const createOrderInDB = async (session, devices, quantityMap, userId, guestToken) => {
    // here we can find user's basket by userId and save basketId to Order
    // if we ever allow multiple simultaneous carts (wishlist, save for later)
    const order = await Order.create({
        ...(session.id ? { stripeSessionId: session.id } : { paypalOrderId: session.paypalOrderId }),
        amount: session.amount_total,
        currency: session.currency.toUpperCase(),
        userId: userId || null,
        guestToken: userId ? null : guestToken,
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
}

class CheckoutController {
    async stripeCheckout(req, res, next) {
        const { id: userId } = req.user || {}
        const guestToken = req.cookies.guestToken
        try {
            const { lineItems, devices, quantityMap, totalAmount } = await prepareLineItems(req.body.items, 'stripe')

            const stripeSession = await stripe.checkout.sessions.create({
                mode: 'payment',
                payment_method_types: ['card'],
                line_items: lineItems,
                shipping_address_collection: {
                    allowed_countries: ['UA'],
                },
                success_url: `${getUrl()}/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${getUrl()}/cancel?session_id={CHECKOUT_SESSION_ID}`,
                expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 minutes from now
            })
            const session = { ...stripeSession, amount_total: totalAmount }

            await createOrderInDB(session, devices, quantityMap, userId, guestToken)

            return res.json({ url: session.url })
        } catch (error) {
            return next(ApiError.internal('Checkout error: ' + error.message))
        }
    }
    async verifyStripeCheckoutSession(req, res, next) {
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
                amount: li.price.unit_amount / 100,
            }))
            return res.json({ items })
        } catch (error) {
            return next(ApiError.badRequest('Checkout session verification error: ' + error.message))
        }
    }
    async paypalCheckout(req, res, next) {
        const { id: userId } = req.user || {}
        const guestToken = req.cookies.guestToken
        try {
            const accessToken = await generatePaypalAccessToken()
            const { lineItems, devices, quantityMap, totalAmount } = await prepareLineItems(req.body.items, 'paypal')

            const response = await fetch(`${process.env.PAYPAL_BASE_URL}/v2/checkout/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    intent: 'CAPTURE',
                    purchase_units: [{
                        amount: {
                            currency_code: currencyCode,
                            value: totalAmount.toFixed(2),
                            breakdown: {
                                item_total: {
                                    currency_code: currencyCode,
                                    value: totalAmount.toFixed(2),
                                },
                            },
                        },
                        items: lineItems,
                    }],
                    application_context: {
                        return_url: `${getUrl()}/success`,
                        cancel_url: `${getUrl()}/cancel`,
                        // shipping_preference: 'GET_FROM_FILE', - default
                        user_action: 'PAY_NOW',
                        brand_name: 'Fullstack Ecommerce',
                    },
                }),
            })
            if (!response.ok) {
                const error = await response.text()
                throw new Error(`PayPal checkout request failed: ${response.status} ${error}`)
            }
            const paypalSession = await response.json()
            const session = {
                paypalOrderId: paypalSession.id,
                amount_total: totalAmount,
                currency: currencyCode,
            }
            await createOrderInDB(session, devices, quantityMap, userId, guestToken)

            return res.json({ url: paypalSession.links.find(link => link.rel === 'approve').href })
        } catch (error) {
            return next(ApiError.internal('Checkout error: ' + error.message))
        }
    }
    async getPaypalOrder(req, res, next) {
        const { orderId } = req.query
        try {
            if (!orderId) {
                return next(ApiError.badRequest('Missing orderId'))
            }
            const accessToken = await generatePaypalAccessToken()
            const response = await fetch(`${process.env.PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                },
            })
            if (!response.ok) {
                const error = await response.text()
                throw new Error(`PayPal get order request failed: ${response.status} ${error}`)
            }
            const order = await response.json()
            if (order.status !== "COMPLETED") {
                return next(ApiError.badRequest('Payment not completed'))
            }
            const items = order.purchase_units[0].items.map((item) => ({
                name: item.name,
                quantity: item.quantity,
                amount: +item.unit_amount.value,
            }))
            return res.json({ items })
        } catch (e) {
            return next(ApiError.internal('Error fetching PayPal order: ' + e.message))
        }
    }
    async cancelOrder(req, res, next) {
        const { paypalId, stripeId } = req.body
        if (!paypalId && !stripeId) {
            return next(ApiError.badRequest('Missing parameters'))
        }
        try {
            const order = await Order.findOne({
                where: paypalId ? { paypalOrderId: paypalId } : { stripeSessionId: stripeId }
            })
            order.status = 'cancelled'
            await order.save()
            return res.json({ message: 'Order canceled successfully' })
        } catch (error) {
            return next(ApiError.internal('Error canceling order: ' + error.message))
        }
    }
}

module.exports = new CheckoutController()


