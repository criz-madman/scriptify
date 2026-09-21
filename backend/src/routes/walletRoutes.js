const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const { requireAuth } = require('../middleware/auth');

// All wallet routes require authentication
router.use(requireAuth);

router.get('/balance', walletController.getBalance);
router.post('/topup', walletController.topupCredits);
router.get('/transactions', walletController.getTransactions);

module.exports = router;
