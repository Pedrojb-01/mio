const express = require('express');
const router = express.Router();
const guard = require('../middlewares/guard_middleware');
const { completeOnboardingController } = require('../controllers/onboarding_controller');

router.post('/', guard, completeOnboardingController);

module.exports = router;