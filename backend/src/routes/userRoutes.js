const express = require('express');
const router = express.Router();

const { getUserById, getAllUsers } = require('../controllers/userController');
const auth = require('../middleware/auth.middleware');

// GET ALL USERS (BY TENANT)
router.get('/', auth, getAllUsers);

// GET SINGLE USER
router.get('/:id', auth, getUserById);

module.exports = router;
