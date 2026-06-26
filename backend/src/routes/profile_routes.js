const express = require('express');
const router = express.Router();
const guard = require('../middlewares/guard_middleware');
const { updateProfileController, getProfileController } = require('../controllers/profile_controller');

router.patch('/', guard, updateProfileController);
router.get('/', guard, getProfileController);

module.exports = router;