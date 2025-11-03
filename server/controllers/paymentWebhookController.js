const Stripe = require('stripe')
const { Order, Basket, BasketDevice } = require('../models/models')
const { generatePaypalAccessToken } = require('../utils')

const stripe = Stripe(process.env.STRIPE_SECRET_KEY)

const verifyPaypalWebhook = async (headers, body) => {
    const accessToken = await generatePaypalAccessToken()
    const response = await fetch(`${process.env.PAYPAL_BASE_URL}/v1/notifications/verify-webhook-signature`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
            auth_algo: headers['paypal-auth-algo'],
            cert_url: headers['paypal-cert-url'],
            transmission_id: headers['paypal-transmission-id'],
            transmission_sig: headers['paypal-transmission-sig'],
            transmission_time: headers['paypal-transmission-time'],
            webhook_id: process.env.PAYPAL_WEBHOOK_ID,
            webhook_event: body
        })
    })
    const result = await response.json()
    return result.verification_status === 'SUCCESS'
}
const capturePaypalPayment = async (orderId) => {
    const accessToken = await generatePaypalAccessToken()
    const response = await fetch(`${process.env.PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
    })
    if (!response.ok) {
        const error = await response.text()
        throw new Error(`PayPal capture request failed: ${response.status} ${error}`)
    }
    return await response.json()
}

class PaymentWebhookController {
    async stripeCheckoutResult(req, res) {
        const sig = req.headers['stripe-signature']
        if (!sig) {
            return res.status(400).send('No stripe-signature header')
        }
        let event
        try {            
            event = stripe.webhooks.constructEvent(
                req.body,
                sig,
                process.env.STRIPE_WEBHOOK_SECRET
            )
        } catch (err) {
            console.error('❌ Webhook signature verification failed:', err.message)
            return res.status(400).send(`Webhook Error: ${err.message}`)
        }

        const session = event.data.object
        const order = await Order.findOne({ where: { stripeSessionId: session.id } })

        switch (event.type) {
            case 'checkout.session.completed':
                const userBasket = order.userId ? await Basket.findOne({ where: { userId: order.userId } }) : null
                if (userBasket) {
                    await BasketDevice.destroy({ where: { basketId: userBasket.id } })
                }
                order.status = 'paid'
                order.shippingName = session.customer_details.name
                order.email = session.customer_details.email
                order.stripePaymentIntentId = session.payment_intent

                const shippingDetails = session.collected_information.shipping_details.address
                order.shippingCity = shippingDetails.city
                order.shippingCountry = shippingDetails.country
                order.shippingLine1 = shippingDetails.line1
                order.shippingLine2 = shippingDetails.line2
                order.shippingPostalCode = shippingDetails.postal_code
                order.shippingState = shippingDetails.state
                await order.save()
            break

            case 'checkout.session.expired':
                order.status = 'cancelled'
                await order.save()
            break

            // default:
            //     console.warn(`Unhandled event type: ${event.type}`)
        }
        res.sendStatus(200)
    }
    async paypalCheckoutResult(req, res) {
        try {
            const body = req.body
            const headers = req.headers
            const verified = await verifyPaypalWebhook(headers, body)
            if (!verified && process.env.NODE_ENV !== 'development') {
                console.warn('⚠️ Invalid PayPal webhook signature')
                return res.sendStatus(400)
            }

            const eventType = body.event_type
            const orderId = body.resource.id
            const order = await Order.findOne({ where: { paypalOrderId: orderId } })

            if (eventType === 'PAYMENT.CAPTURE.COMPLETED') {
                const capture = await capturePaypalPayment(orderId)

                const userBasket = order.userId ? await Basket.findOne({ where: { userId: order.userId } }) : null
                if (userBasket) {
                    await BasketDevice.destroy({ where: { basketId: userBasket.id } })
                }

                order.status = 'paid'
                order.shippingName = capture.payer.name.given_name + ' ' + capture.payer.name.surname
                order.email = capture.payer.email_address
                order.paypalCaptureId = capture.purchase_units[0].payments.captures[0].id

                const shippingDetails = capture.purchase_units[0].shipping.address
                order.shippingCity = shippingDetails.admin_area_2
                order.shippingCountry = shippingDetails.country_code
                order.shippingLine1 = shippingDetails.address_line_1
                order.shippingLine2 = shippingDetails.address_line_2
                order.shippingPostalCode = shippingDetails.postal_code
                order.shippingState = shippingDetails.admin_area_1
                await order.save()
            }
            if (eventType === 'PAYMENT.CAPTURE.DENIED') {
                order.status = 'cancelled'
                await order.save()
            }
            res.sendStatus(200)
        } catch (err) {
            console.error('Webhook error:', err)
            res.sendStatus(500)
        }
    }
}

module.exports = new PaymentWebhookController()