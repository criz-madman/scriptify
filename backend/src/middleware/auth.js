const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { query } = require('../config/db');

/**
 * Authentication middleware to verify JWT and attach user to request
 */
const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required. Please provide a valid Bearer token.'
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Token missing.'
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, env.jwtSecret);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: 'Session expired. Please log in again.'
        });
      }
      return res.status(401).json({
        success: false,
        error: 'Invalid authentication token.'
      });
    }

    // Verify user still exists in database
    const userResult = await query(
      'SELECT "userId", "email", "createdAt" FROM "Users" WHERE "userId" = $1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'User account not found or removed.'
      });
    }

    // Attach user payload
    req.user = userResult.rows[0];
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  requireAuth
};
