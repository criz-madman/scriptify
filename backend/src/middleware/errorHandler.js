const env = require('../config/env');

/**
 * Centralized error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err);

  const statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);

  res.status(statusCode).json({
    success: false,
    error: err.message || 'An unexpected internal server error occurred.',
    ...(env.nodeEnv === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
