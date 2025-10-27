const express = require('express');
const { 
  registerUser, 
  loginUser, 
  forgotPassword, 
  resetPassword, 
  getMe 
} = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/me', authenticateToken, getMe);

module.exports = router;