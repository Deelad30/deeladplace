const express = require('express');
const { loginUser, getMe } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.post('/login', loginUser);
router.get('/me', authenticateToken, getMe);

module.exports = router;