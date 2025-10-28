const Stripe = require('stripe')
const { Order } = require('../models/models')

const stripe = Stripe(process.env.STRIPE_SECRET_KEY)

class StripeWebhookController {
    async checkoutResult(req, res) {
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
                order.status = 'paid'
                order.shippingName = session.customer_details.name
                order.email = session.customer_details.email
                order.stripePaymentIntentId = session.payment_intent

                const shippingDetails = session.collected_information.shipping_details
                order.shippingCity = shippingDetails.address.city
                order.shippingCountry = shippingDetails.address.country
                order.shippingLine1 = shippingDetails.address.line1
                order.shippingLine2 = shippingDetails.address.line2
                order.shippingPostalCode = shippingDetails.address.postal_code
                order.shippingState = shippingDetails.address.state
            break

            case 'checkout.session.expired':
                order.status = 'cancelled'
            break

            // default:
            //     console.warn(`Unhandled event type: ${event.type}`)
        }
        await order.save()
        res.sendStatus(200)
    }
}

module.exports = new StripeWebhookController()