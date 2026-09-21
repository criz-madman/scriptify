const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/db');
const env = require('../config/env');
const { sendOtpEmail } = require('../services/emailService');

/**
 * Controller handling passwordless Email OTP Authentication
 */

// 1. Send OTP to user's email
const sendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid email address.'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Generate 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const salt = await bcrypt.genSalt(10);
    const otpHash = await bcrypt.hash(otp, salt);

    // Set 10-minute expiration
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Store in AuthOtpTokens table
    await query(
      `INSERT INTO "AuthOtpTokens" ("email", "otpHash", "expiresAt") 
       VALUES ($1, $2, $3)`,
      [normalizedEmail, otpHash, expiresAt]
    );

    // Dispatch OTP via email service
    const emailResult = await sendOtpEmail(normalizedEmail, otp);

    res.status(200).json({
      success: true,
      message: `A 6-digit verification code has been dispatched to ${normalizedEmail}.`,
      expiresInMinutes: 10,
      ...(emailResult.devOtp && { devOtp: emailResult.devOtp })
    });
  } catch (err) {
    next(err);
  }
};

// 2. Verify OTP, upsert user and wallet, and issue JWT token
const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        error: 'Both email and verification code are required.'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Query active unexpired and unconsumed OTPs for this email
    const otpRes = await query(
      `SELECT "id", "otpHash", "expiresAt" 
       FROM "AuthOtpTokens" 
       WHERE LOWER("email") = $1 
         AND "consumed" = FALSE 
         AND "expiresAt" > CURRENT_TIMESTAMP 
       ORDER BY "createdAt" DESC 
       LIMIT 1`,
      [normalizedEmail]
    );

    if (otpRes.rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired verification code. Please request a new code.'
      });
    }

    const tokenRecord = otpRes.rows[0];
    const isMatch = await bcrypt.compare(otp.trim(), tokenRecord.otpHash);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        error: 'Incorrect verification code. Please verify and try again.'
      });
    }

    // Mark OTP as consumed to prevent replay attacks
    await query(
      'UPDATE "AuthOtpTokens" SET "consumed" = TRUE WHERE "id" = $1',
      [tokenRecord.id]
    );

    // Find or create user in Users table (Table D1)
    let user;
    const existingUserRes = await query(
      'SELECT "userId", "email", "createdAt" FROM "Users" WHERE LOWER("email") = $1',
      [normalizedEmail]
    );

    let isNewUser = false;
    if (existingUserRes.rows.length > 0) {
      user = existingUserRes.rows[0];
    } else {
      isNewUser = true;
      const newUserRes = await query(
        `INSERT INTO "Users" ("email") 
         VALUES ($1) 
         RETURNING "userId", "email", "createdAt"`,
        [normalizedEmail]
      );
      user = newUserRes.rows[0];

      // Grant new user initial starter credits in CreditWallet (Table D2)
      await query(
        `INSERT INTO "CreditWallet" ("userId", "balancePoints") 
         VALUES ($1, $2)`,
        [user.userId, env.initialCredits]
      );
    }

    // Fetch current wallet balance
    const walletRes = await query(
      'SELECT "balancePoints" FROM "CreditWallet" WHERE "userId" = $1',
      [user.userId]
    );
    const balance = walletRes.rows.length > 0 ? walletRes.rows[0].balancePoints : env.initialCredits;

    // Issue JWT
    const token = jwt.sign(
      {
        userId: user.userId,
        email: user.email
      },
      env.jwtSecret,
      { expiresIn: env.jwtExpiresIn }
    );

    res.status(200).json({
      success: true,
      message: isNewUser ? 'Welcome to Scriptify! Account created with 100 free credits.' : 'Signed in successfully.',
      token,
      user: {
        userId: user.userId,
        email: user.email,
        createdAt: user.createdAt
      },
      walletBalance: balance
    });
  } catch (err) {
    next(err);
  }
};

// 3. Get profile & live wallet balance
const getMe = async (req, res, next) => {
  try {
    const walletRes = await query(
      'SELECT "balancePoints" FROM "CreditWallet" WHERE "userId" = $1',
      [req.user.userId]
    );

    const balance = walletRes.rows.length > 0 ? walletRes.rows[0].balancePoints : 0;

    res.status(200).json({
      success: true,
      user: req.user,
      walletBalance: balance
    });
  } catch (err) {
    next(err);
  }
};

// 4. Authenticate or Register with Firebase
const firebaseLogin = async (req, res, next) => {
  try {
    const { email, uid, displayName } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        error: 'A valid email address is required from Firebase authentication.'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find or create user in Users table (Table D1)
    let user;
    const existingUserRes = await query(
      'SELECT "userId", "email", "createdAt" FROM "Users" WHERE LOWER("email") = $1',
      [normalizedEmail]
    );

    let isNewUser = false;
    if (existingUserRes.rows.length > 0) {
      user = existingUserRes.rows[0];
    } else {
      isNewUser = true;
      const newUserRes = await query(
        `INSERT INTO "Users" ("email") 
         VALUES ($1) 
         RETURNING "userId", "email", "createdAt"`,
        [normalizedEmail]
      );
      user = newUserRes.rows[0];

      // Grant new user initial starter credits in CreditWallet (Table D2)
      await query(
        `INSERT INTO "CreditWallet" ("userId", "balancePoints") 
         VALUES ($1, $2)`,
        [user.userId, env.initialCredits]
      );
    }

    // Fetch current wallet balance
    const walletRes = await query(
      'SELECT "balancePoints" FROM "CreditWallet" WHERE "userId" = $1',
      [user.userId]
    );
    const balance = walletRes.rows.length > 0 ? walletRes.rows[0].balancePoints : env.initialCredits;

    // Issue JWT
    const token = jwt.sign(
      {
        userId: user.userId,
        email: user.email,
        firebaseUid: uid || null
      },
      env.jwtSecret,
      { expiresIn: env.jwtExpiresIn }
    );

    res.status(200).json({
      success: true,
      message: isNewUser ? 'Welcome to Scriptify! Account created with 100 free credits.' : 'Signed in with Firebase successfully.',
      token,
      user: {
        userId: user.userId,
        email: user.email,
        displayName: displayName || null,
        createdAt: user.createdAt
      },
      walletBalance: balance
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  sendOtp,
  verifyOtp,
  getMe,
  firebaseLogin
};
