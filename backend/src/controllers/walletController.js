const walletService = require('../services/walletService');

/**
 * Controller handling Credit Wallet & Transaction Operations
 */

// 1. Get current user's balance
const getBalance = async (req, res, next) => {
  try {
    const wallet = await walletService.getBalance(req.user.userId);
    res.status(200).json({
      success: true,
      wallet: {
        walletId: wallet.walletId,
        balancePoints: wallet.balancePoints,
        updatedAt: wallet.updatedAt
      }
    });
  } catch (err) {
    next(err);
  }
};

// 2. Top-up credits via simulated or provider payment gateway
const topupCredits = async (req, res, next) => {
  try {
    const { amountPaid, creditPoints, paymentMethod = 'stripe_checkout' } = req.body;

    const parsedAmount = parseFloat(amountPaid);
    const parsedCredits = parseInt(creditPoints, 10);

    if (isNaN(parsedAmount) || parsedAmount < 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid payment amount specified.'
      });
    }

    if (isNaN(parsedCredits) || parsedCredits <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Credit points must be a positive integer.'
      });
    }

    const result = await walletService.topupCredits(
      req.user.userId,
      parsedAmount,
      parsedCredits,
      paymentMethod
    );

    res.status(200).json({
      success: true,
      message: `Successfully added ${parsedCredits} credits to your wallet.`,
      newBalance: result.newBalance,
      transactionId: result.transactionId,
      timestamp: result.timestamp
    });
  } catch (err) {
    next(err);
  }
};

// 3. Get transaction history (Table D4)
const getTransactions = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit || '50', 10);
    const transactions = await walletService.getTransactions(req.user.userId, limit);

    res.status(200).json({
      success: true,
      count: transactions.length,
      transactions
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getBalance,
  topupCredits,
  getTransactions
};
