const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');

router.post('/signup', AuthController.signup); // creates tenant + admin user (no payment webhook here)
router.post('/login', AuthController.login);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);

module.exports = router;
