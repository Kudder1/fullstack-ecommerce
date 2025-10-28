const Router = require('express');
const router = new Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/registration', userController.registration);
router.post('/login', userController.login);
router.post('/login-google', userController.loginWithGoogle);
router.get('/auth', authMiddleware, userController.checkAuth);
router.get('/verify-email', authMiddleware, userController.verifyEmail);
router.get('/reverify-email', authMiddleware, userController.reverifyEmail);
router.post('/recover-password', userController.recoverPassword);
router.post('/new-password', userController.newPassword);

module.exports = router