const Router = require('express')
const checkoutController = require('../controllers/checkoutController')
const router = new Router()
const optionalAuthMiddleware = require('../middleware/optionalAuthMiddleware')

router.post('/stripe', optionalAuthMiddleware, checkoutController.stripeCheckout)
router.get('/stripe/verify', checkoutController.verifyStripeCheckoutSession)

router.post('/paypal', optionalAuthMiddleware, checkoutController.paypalCheckout)
router.get('/paypal/getOrder', checkoutController.getPaypalOrder)

router.post('/cancel', checkoutController.cancelOrder)

module.exports = router