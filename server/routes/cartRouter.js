const Router = require('express');
const cartController = require('../controllers/cartController');
const router = new Router();
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, cartController.get);

router.post('/add', authMiddleware, cartController.add);
router.post('/update', authMiddleware, cartController.update);

router.post('/guest-token', cartController.generateGuestToken);

module.exports = router