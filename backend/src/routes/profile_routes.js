const express = require('express');
const router = express.Router();
const guard = require('../middlewares/guard_middleware');
const { updateProfileController } = require('../controllers/profile_controller');

router.patch('/', guard, updateProfileController);

module.exports = router;