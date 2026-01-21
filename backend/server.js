require('dotenv').config();
const express = require('express');
const cors = require('cors');
const database = require('./src/config/database');
const emailService = require('./src/utils/emailService');
const paystackRoutes = require('./src/routes/paystack');
const webhookRoutes = require('./src/routes/webhook');

const app = express();
const PORT = process.env.PORT || 5000;
const rateLimit = require('express-rate-limit');
const logger = require('./src/utils/logger');

// CORS Configuration - Only allow requests from configured client
app.use(cors({
  origin: process.env.NODE_ENV === 'development'
    ? [process.env.CLIENT_URL, 'http://localhost:3000'].filter(Boolean)
    : process.env.CLIENT_URL,
  credentials: true
}));

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'development' ? 10000 : 100, // Higher limit for dev
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiter to all API routes
app.use('/api/', apiLimiter);

// Structured Logging with Morgan + Winston
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(require('morgan')(morganFormat, {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));
app.use(express.json());

app.use('/api/paystack', paystackRoutes); // Keeping for legacy reference or mixed use
app.use('/api/paystack/webhook', webhookRoutes);

// FLUTTERWAVE ROUTES
const flutterwaveRoutes = require('./src/routes/flutterwave');
app.use('/api/flutterwave', flutterwaveRoutes);

app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));


// Import routes
// const authRoutes = require('./src/routes/auth');
const vendorRoutes = require('./src/routes/vendors');
const productRoutes = require('./src/routes/products');
const salesRoutes = require('./src/routes/sales');
const expenseRoutes = require('./src/routes/expenses');
// const inventoryRoutes = require('./src/routes/inventory');
const rawMaterialRoutes = require('./src/routes/rawMaterials');
const authRoutes = require('./src/routes/auth.routes');
const inviteRoutes = require('./src/routes/invite.routes');
const materialRoutes = require('./src/routes/material.routes');
const recipeRoutes = require('./src/routes/recipe.routes');
const purchaseRoutes = require('./src/routes/purchase.routes');
const costingRoutes = require('./src/routes/costing.routes');
const packagingRoutes = require('./src/routes/packaging.routes');
const packagingMapRoutes = require('./src/routes/packagingMap.routes');
const labourRoutes = require('./src/routes//labour.routes');
const opexRoutes = require('./src/routes/opex.routes');
const sicRoutes = require('./src/routes/sic.routes');
const invRoutes = require('./src/routes/inventory.routes');
const posRoutes = require('./src/routes/pos.routes');
const standardRoutes = require('./src/routes/standard.routes');
const stocksRoutes = require('./src/routes/stocksRoutes');
const reportsRoutes = require('./src/routes/reports.routes');
const userRoutes = require('./src/routes/userRoutes');
const productLabourRoutes = require('./src/routes/productLabour.routes');
const productOpexRoutes = require('./src/routes/productOpex.routes');


// Use routes
app.use('/api/users', userRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/opex', opexRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/labour', labourRoutes);
app.use("/debug", require("./src/routes/testEmail"));

app.use('/api/packaging', packagingRoutes);
app.use('/api/raw-materials', rawMaterialRoutes);
app.use("/api/report", require("./src/routes/profitability.routes"));
app.use('/api/packaging-map', packagingMapRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/expenses', expenseRoutes);
// app.use('/api/inventory', inventoryRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/invite', inviteRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/costing', costingRoutes);
app.use('/api/sic', sicRoutes);
app.use('/api/inventory', invRoutes);
app.use('/api/pos', posRoutes);
app.use('/api/standard', standardRoutes);
app.use('/api/stocks', stocksRoutes);
app.use('/api/product-labour', productLabourRoutes);
app.use('/api/product-opex', productOpexRoutes);


// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  logger.error('Server Error', { 
    error: error.message, 
    stack: error.stack,
    path: req.path,
    method: req.method
  });

  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  logger.info(`Server running on port ${PORT}`, { env: process.env.NODE_ENV });
});


module.exports = app;