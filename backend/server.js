require('dotenv').config();
const express = require('express');
const cors = require('cors');
const database = require('./src/config/database');
const emailService = require('./src/utils/emailService');
const paystackRoutes = require('./src/routes/paystack');
const webhookRoutes = require('./src/routes/webhook');

const app = express();
const PORT = process.env.PORT || 5000;


// Middleware
app.use(cors());
app.use(express.json());


app.use('/api/paystack', paystackRoutes);
app.use('/api/paystack/webhook', webhookRoutes);
// Add this before your other routes
app.get('/api/test-email', async (req, res) => {
  try {
    await emailService.sendWelcomeEmail({
      name: 'Test User',
      email: 'deeladplacesoftwork@gmail.com', // Your email
      role: 'admin'
    });
    res.json({ success: true, message: 'Test email sent successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const result = await database.query('SELECT NOW()');
    res.json({
      status: 'OK',
      database: 'Connected',
      timestamp: result.rows[0].now
    });
  } catch (error) {
    res.status(500).json({
      status: 'Error',
      database: 'Disconnected',
      error: error.message
    });
  }
});

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
const reportsRoutes = require('./src/routes/reports.routes');


// Use routes
app.use('/api/reports', reportsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/opex', opexRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/labour', labourRoutes);
app.use('/api/packaging', packagingRoutes);
app.use('/api/raw-materials', rawMaterialRoutes);
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


// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Deelad Place API server running on port ${PORT}`);
});

module.exports = app;