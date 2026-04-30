const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');

const { validate } = require('../middleware/validation');

const { authenticateToken } = require('../middleware/auth');

router.post('/register', validate('register'), AuthController.signup); // creates tenant + admin user (no payment webhook here)
router.post('/login', validate('login'), AuthController.login);
router.post('/google', validate('googleAuth'), AuthController.googleAuth);
router.post('/forgot-password', validate('forgotPassword'), AuthController.forgotPassword);
router.post('/reset-password', validate('resetPassword'), AuthController.resetPassword);

// Protected routes
router.get('/me', authenticateToken, AuthController.getMe);
router.put('/update-logo', authenticateToken, AuthController.updateLogo);
router.delete('/delete-logo', authenticateToken, AuthController.deleteLogo);

module.exports = router;
