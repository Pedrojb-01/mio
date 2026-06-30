const express = require('express');
const router = express.Router();
const { registerController, loginController, logoutController } = require('../controllers/auth_controllers');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { message: 'Too many attempts, please try again later' }
});

router.post('/register', authLimiter, registerController);
router.post('/login', authLimiter, loginController);
router.post('/logout', logoutController);

module.exports = router;