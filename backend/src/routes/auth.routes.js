const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');

const { validate } = require('../middleware/validation');

router.post('/register', validate('register'), AuthController.signup); // creates tenant + admin user (no payment webhook here)
router.post('/login', validate('login'), AuthController.login);
router.post('/forgot-password', validate('forgotPassword'), AuthController.forgotPassword);
router.post('/reset-password', validate('resetPassword'), AuthController.resetPassword);

module.exports = router;
