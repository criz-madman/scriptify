const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// Public routes for Email OTP & Firebase Authentication
router.post('/send-otp', authController.sendOtp);
router.post('/verify-otp', authController.verifyOtp);
router.post('/firebase-login', authController.firebaseLogin);

// Authenticated route to get current user & wallet
router.get('/me', requireAuth, authController.getMe);

// Admin routes
router.get('/admin/users', requireAuth, requireAdmin, authController.getAllUsersForAdmin);
router.get('/admin/stats', requireAuth, requireAdmin, authController.getAdminStats);

module.exports = router;
