const Router = require('express');
const deviceController = require('../controllers/deviceController');
const router = new Router();
const checkRole = require('../middleware/checkRoleMiddleware'); 

router.post('/', checkRole('ADMIN'), deviceController.create)
router.post('/upload-url', checkRole('ADMIN'), deviceController.getUploadUrl)
router.put('/:id', checkRole('ADMIN'), deviceController.update)
router.get('/', deviceController.getAll)
router.get('/:id', deviceController.getOne)

module.exports = router