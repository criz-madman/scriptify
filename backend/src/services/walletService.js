const { getClient, query } = require('../config/db');
const env = require('../config/env');

/**
 * Get current wallet balance for a user
 * @param {string} userId
 * @returns {Promise<{ balancePoints: number, walletId: string }>}
 */
const getBalance = async (userId) => {
  const res = await query(
    'SELECT "walletId", "balancePoints", "updatedAt" FROM "CreditWallet" WHERE "userId" = $1',
    [userId]
  );

  if (res.rows.length === 0) {
    // If no wallet exists yet, create one with default initial credits
    const insertRes = await query(
      `INSERT INTO "CreditWallet" ("userId", "balancePoints") 
       VALUES ($1, $2) 
       RETURNING "walletId", "balancePoints", "updatedAt"`,
      [userId, env.initialCredits]
    );
    return insertRes.rows[0];
  }

  return res.rows[0];
};

/**
 * Atomically deduct credits for a script generation task using row-level locking (SELECT ... FOR UPDATE)
 * Guarantees zero race conditions and enforces non-negative balance constraint.
 * 
 * @param {string} userId
 * @param {number} cost Amount of credits to deduct (default 1)
 * @param {object} actionDetails Metadata for HistoryLog (script type, name, options)
 * @returns {Promise<{ remainingBalance: number, historyId: string }>}
 */
const deductCreditsForScript = async (userId, cost = env.costPerScript, actionDetails = {}) => {
  const client = await getClient();

  try {
    await client.query('BEGIN');

    // 1. Lock the wallet row for this user
    const walletRes = await client.query(
      'SELECT "walletId", "balancePoints" FROM "CreditWallet" WHERE "userId" = $1 FOR UPDATE',
      [userId]
    );

    if (walletRes.rows.length === 0) {
      throw {
        statusCode: 404,
        message: 'Credit wallet not found for user.'
      };
    }

    const currentBalance = walletRes.rows[0].balancePoints;

    // 2. Check sufficient balance
    if (currentBalance < cost) {
      throw {
        statusCode: 402, // 402 Payment Required
        message: `Insufficient credits. Required: ${cost}, Available: ${currentBalance}. Please top up your wallet.`
      };
    }

    const newBalance = currentBalance - cost;

    // 3. Update wallet balance
    await client.query(
      'UPDATE "CreditWallet" SET "balancePoints" = $1, "updatedAt" = CURRENT_TIMESTAMP WHERE "userId" = $2',
      [newBalance, userId]
    );

    // 4. Record action in HistoryLog (Table D3)
    const logPayload = {
      ...actionDetails,
      creditsDeducted: cost,
      previousBalance: currentBalance,
      remainingBalance: newBalance,
      clientTimestamp: new Date().toISOString()
    };

    const historyRes = await client.query(
      `INSERT INTO "HistoryLog" ("userId", "actionDetails") 
       VALUES ($1, $2) 
       RETURNING "historyId", "timestamp"`,
      [userId, JSON.stringify(logPayload)]
    );

    await client.query('COMMIT');

    return {
      remainingBalance: newBalance,
      historyId: historyRes.rows[0].historyId,
      timestamp: historyRes.rows[0].timestamp
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

/**
 * Process a credit top-up transaction (Table D4: Transactions and Table D2: CreditWallet)
 * 
 * @param {string} userId
 * @param {number} amountPaid Currency amount paid ($)
 * @param {number} creditPoints Number of credits purchased
 * @param {string} paymentMethod e.g., 'stripe', 'card', 'paypal', 'dev_grant'
 * @returns {Promise<{ newBalance: number, transactionId: string }>}
 */
const topupCredits = async (userId, amountPaid, creditPoints, paymentMethod = 'stripe_checkout') => {
  const client = await getClient();

  try {
    await client.query('BEGIN');

    // 1. Record the financial transaction in Transactions (Table D4)
    const txRes = await client.query(
      `INSERT INTO "Transactions" ("userId", "amountPaid", "paymentMethod", "status") 
       VALUES ($1, $2, $3, 'completed') 
       RETURNING "transactionId", "timestamp"`,
      [userId, amountPaid, paymentMethod]
    );

    const transactionId = txRes.rows[0].transactionId;

    // 2. Lock wallet and increment balance
    const walletRes = await client.query(
      'SELECT "balancePoints" FROM "CreditWallet" WHERE "userId" = $1 FOR UPDATE',
      [userId]
    );

    let updatedBalance;
    if (walletRes.rows.length === 0) {
      const createRes = await client.query(
        `INSERT INTO "CreditWallet" ("userId", "balancePoints") 
         VALUES ($1, $2) 
         RETURNING "balancePoints"`,
        [userId, env.initialCredits + creditPoints]
      );
      updatedBalance = createRes.rows[0].balancePoints;
    } else {
      const updateRes = await client.query(
        `UPDATE "CreditWallet" 
         SET "balancePoints" = "balancePoints" + $1, "updatedAt" = CURRENT_TIMESTAMP 
         WHERE "userId" = $2 
         RETURNING "balancePoints"`,
        [creditPoints, userId]
      );
      updatedBalance = updateRes.rows[0].balancePoints;
    }

    // 3. Optional audit log entry in HistoryLog
    await client.query(
      `INSERT INTO "HistoryLog" ("userId", "actionDetails") 
       VALUES ($1, $2)`,
      [
        userId,
        JSON.stringify({
          action: 'WALLET_TOPUP',
          amountPaid,
          creditPointsAdded: creditPoints,
          transactionId,
          newBalance: updatedBalance
        })
      ]
    );

    await client.query('COMMIT');

    return {
      newBalance: updatedBalance,
      transactionId,
      timestamp: txRes.rows[0].timestamp
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

/**
 * Fetch transaction history for a user
 * @param {string} userId
 * @param {number} limit
 */
const getTransactions = async (userId, limit = 50) => {
  const res = await query(
    `SELECT "transactionId", "amountPaid", "paymentMethod", "status", "timestamp" 
     FROM "Transactions" 
     WHERE "userId" = $1 
     ORDER BY "timestamp" DESC 
     LIMIT $2`,
    [userId, limit]
  );
  return res.rows;
};

/**
 * Fetch generation history log for a user
 * @param {string} userId
 * @param {number} limit
 */
const getHistoryLogs = async (userId, limit = 50) => {
  const res = await query(
    `SELECT "historyId", "actionDetails", "timestamp" 
     FROM "HistoryLog" 
     WHERE "userId" = $1 
     ORDER BY "timestamp" DESC 
     LIMIT $2`,
    [userId, limit]
  );
  return res.rows;
};

module.exports = {
  getBalance,
  deductCreditsForScript,
  topupCredits,
  getTransactions,
  getHistoryLogs
};
