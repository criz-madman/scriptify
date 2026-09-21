const express = require('express');
const router = express.Router();
const scriptController = require('../controllers/scriptController');
const { requireAuth } = require('../middleware/auth');

// Public route to view available presets
router.get('/presets', scriptController.getPresets);

// Protected routes for generation and user history
router.post('/generate', requireAuth, scriptController.generateScript);
router.get('/history', requireAuth, scriptController.getHistory);

module.exports = router;
