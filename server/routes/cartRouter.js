const Router = require('express');
const cartController = require('../controllers/cartController');
const router = new Router();
const authMiddleware = require('../middleware/authMiddleware');
const optionalAuthMiddleware = require('../middleware/optionalAuthMiddleware');

router.post('/', authMiddleware, cartController.create);
router.get('/', authMiddleware, cartController.get);

router.post('/add', authMiddleware, cartController.add);
router.post('/update', authMiddleware, cartController.update);

router.post('/checkout', optionalAuthMiddleware, cartController.checkout);
router.get('/checkout/verify', cartController.verifyCheckoutSession);

router.post('/guest-token', cartController.generateGuestToken);

module.exports = router