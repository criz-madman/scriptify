const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { requireAuth } = require('../middleware/auth');
const marketplaceService = require('../services/marketplaceService');

/**
 * Optional authentication helper: extracts user if token provided, but doesn't reject guests
 */
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, env.jwtSecret);
      req.user = { userId: decoded.userId, email: decoded.email };
    } catch (e) {
      // Ignore invalid token for guest browsing
    }
  }
  next();
};

/**
 * GET /api/marketplace/products
 * Fetch products with optional filtering by category and search term
 */
router.get('/products', optionalAuth, async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const userId = req.user ? req.user.userId : null;

    const products = await marketplaceService.getProducts({ category, search, userId });
    res.json({
      success: true,
      count: products.length,
      products
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/marketplace/products/:id
 * Get single product by ID
 */
router.get('/products/:id', optionalAuth, async (req, res, next) => {
  try {
    const userId = req.user ? req.user.userId : null;
    const product = await marketplaceService.getProductById(req.params.id, userId);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/marketplace/purchase
 * Buy a digital product with credit wallet deduction
 */
router.post('/purchase', requireAuth, async (req, res, next) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ success: false, error: 'productId is required.' });
    }

    const result = await marketplaceService.purchaseProduct(req.user.userId, productId);
    res.json({
      success: true,
      ...result
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/marketplace/products
 * Admin endpoint: Add new product to marketplace
 */
router.post('/products', async (req, res, next) => {
  try {
    const { title, description, category, creditPrice, instructions, payloadCode, version, author } = req.body;
    const newProduct = await marketplaceService.createProduct({
      title,
      description,
      category,
      creditPrice,
      instructions,
      payloadCode,
      version,
      author
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully!',
      product: newProduct
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/marketplace/purchases
 * Get user's purchased items
 */
router.get('/purchases', requireAuth, async (req, res, next) => {
  try {
    const purchases = await marketplaceService.getUserPurchases(req.user.userId);
    res.json({
      success: true,
      purchases
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
