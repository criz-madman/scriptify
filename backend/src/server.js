const express = require('express');
const cors = require('cors');
const path = require('path');
const env = require('./config/env');
const { testConnection } = require('./config/db');

// Import route handlers
const authRoutes = require('./routes/authRoutes');
const walletRoutes = require('./routes/walletRoutes');
const scriptRoutes = require('./routes/scriptRoutes');
const marketplaceRoutes = require('./routes/marketplaceRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Enable CORS
app.use(cors({
  origin: true,
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Static directory for frontend assets (css, js, images)
const frontendPath = path.join(__dirname, '../../frontend');
app.use(express.static(frontendPath));

// Favicon route
app.get('/favicon.ico', (req, res) => res.sendFile(path.join(frontendPath, 'myimages/scriptfy icon.png')));

// Health check endpoint
app.get('/health', async (req, res) => {
  const dbConnected = await testConnection();
  res.status(200).json({
    status: 'ok',
    service: 'Scriptify Multi-Page API',
    database: dbConnected ? 'connected' : 'disconnected / check .env',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/scripts', scriptRoutes);
app.use('/api/marketplace', marketplaceRoutes);

// Multi-Page Clean HTML Routing
app.get('/', (req, res) => res.sendFile(path.join(frontendPath, 'index.html')));
app.get('/login', (req, res) => res.sendFile(path.join(frontendPath, 'login.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(frontendPath, 'dashboard.html')));
app.get('/panel-builder', (req, res) => res.sendFile(path.join(frontendPath, 'panel-builder.html')));
app.get('/text-animator', (req, res) => res.sendFile(path.join(frontendPath, 'text-animator.html')));
app.get('/presets', (req, res) => res.sendFile(path.join(frontendPath, 'presets.html')));
app.get('/marketplace', (req, res) => res.sendFile(path.join(frontendPath, 'presets.html')));
app.get('/shop', (req, res) => res.sendFile(path.join(frontendPath, 'presets.html')));
app.get('/wallet', (req, res) => res.sendFile(path.join(frontendPath, 'wallet.html')));

// Fallback for SPA or trailing slashes
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return next();
  }
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Centralized error handling
app.use(errorHandler);

// Start server
const startServer = async () => {
  console.log('====================================================');
  console.log('            SCRIPTIFY MULTI-PAGE SERVER             ');
  console.log('====================================================');

  await testConnection();

  app.listen(env.port, () => {
    console.log(`[Scriptify API]       Running on http://localhost:${env.port}`);
    console.log(`[Scriptify Web App]   Pages available at:`);
    console.log(`  - Home / Landing:   http://localhost:${env.port}/`);
    console.log(`  - Login (OTP):      http://localhost:${env.port}/login`);
    console.log(`  - Dashboard:        http://localhost:${env.port}/dashboard`);
    console.log(`  - UI Panel Builder: http://localhost:${env.port}/panel-builder`);
    console.log(`  - Text Animator:    http://localhost:${env.port}/text-animator`);
    console.log(`  - Preset Studio:    http://localhost:${env.port}/presets`);
    console.log(`  - Credit Wallet:    http://localhost:${env.port}/wallet`);
    console.log('====================================================');
  });
};

if (require.main === module) {
  startServer();
}

module.exports = app;
