const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const auth = require('../middleware/auth.middleware'); 

router.get('/', auth, notificationController.getNotifications);
router.patch('/:id/read', auth, notificationController.markAsRead);
router.patch('/read-all', auth, notificationController.markAllAsRead);

module.exports = router;
