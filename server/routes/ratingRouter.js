const Router = require('express');
const ratingController = require('../controllers/ratingController');
const router = new Router();
const checkRole = require('../middleware/checkRoleMiddleware'); 
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, ratingController.getAllUsersRatedDevices);
router.post('/', authMiddleware, ratingController.addRating);
router.delete('/:rateId', checkRole('ADMIN'), ratingController.deleteDeviceRating);

module.exports = router