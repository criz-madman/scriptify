const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');

// Public routes for Email OTP
router.post('/send-otp', authController.sendOtp);
router.post('/verify-otp', authController.verifyOtp);

// Authenticated route to get current user & wallet
router.get('/me', requireAuth, authController.getMe);

module.exports = router;
