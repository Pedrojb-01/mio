const express = require('express');
const router = express.Router();
const guard = require('../middlewares/guard_middleware');
const admin = require('../middlewares/admin_middleware');
const { listUsersController, updateUserStatusController, getStatsController, deleteUserController } = require('../controllers/admin_controller');

router.get('/users', guard, admin, listUsersController);
router.patch('/users/:id/status', guard, admin, updateUserStatusController);
router.get('/stats', guard, admin, getStatsController);
router.delete('/users/:id', guard, admin, deleteUserController);

module.exports = router;