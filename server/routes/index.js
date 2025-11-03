const Router = require('express');
const router = new Router();
const deviceRouter = require('./deviceRouter');
const brandRouter = require('./brandRouter');
const typeRouter = require('./typeRouter');
const userRouter = require('./userRouter')
const cartRouter = require('./cartRouter')
const ratingRouter = require('./ratingRouter')
const checkoutRouter = require('./checkoutRouter')

router.use('/user', userRouter);
router.use('/type', typeRouter);
router.use('/brand', brandRouter);
router.use('/device', deviceRouter);
router.use('/cart', cartRouter);
router.use('/rating', ratingRouter);
router.use('/checkout', checkoutRouter);

module.exports = router;