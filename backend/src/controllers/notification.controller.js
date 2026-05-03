const notificationService = require('../services/notification.service');
const logger = require('../utils/logger');

async function getNotifications(req, res) {
    const tenantId = req.user.tenant_id;
    const { limit, unreadOnly } = req.query;

    try {
        const notifications = await notificationService.getNotifications(tenantId, {
            limit: limit ? parseInt(limit) : 20,
            unreadOnly: unreadOnly === 'true'
        });
        res.json({ success: true, notifications });
    } catch (err) {
        logger.error('Controller: Failed to fetch notifications', { error: err.message, tenantId });
        res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
    }
}

async function markAsRead(req, res) {
    const tenantId = req.user.tenant_id;
    const { id } = req.params;

    try {
        await notificationService.markAsRead(id, tenantId);
        res.json({ success: true, message: 'Notification marked as read' });
    } catch (err) {
        logger.error('Controller: Failed to mark notification as read', { error: err.message, id, tenantId });
        res.status(500).json({ success: false, message: 'Failed to update notification' });
    }
}

async function markAllAsRead(req, res) {
    const tenantId = req.user.tenant_id;

    try {
        await notificationService.markAllAsRead(tenantId);
        res.json({ success: true, message: 'All notifications marked as read' });
    } catch (err) {
        logger.error('Controller: Failed to mark all notifications as read', { error: err.message, tenantId });
        res.status(500).json({ success: false, message: 'Failed to update notifications' });
    }
}

module.exports = {
    getNotifications,
    markAsRead,
    markAllAsRead
};
