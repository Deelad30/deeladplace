const db = require('../config/database');
const logger = require('../utils/logger');

/**
 * Create a new notification
 */
async function createNotification({ tenant_id, type, title, message, data = {} }) {
    try {
        const res = await db.query(
            `INSERT INTO notifications (tenant_id, type, title, message, data)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [tenant_id, type, title, message, JSON.stringify(data)]
        );
        return res.rows[0];
    } catch (err) {
        logger.error('Failed to create notification', { error: err.message, tenant_id, type });
        throw err;
    }
}

/**
 * Get notifications for a tenant
 */
async function getNotifications(tenant_id, { limit = 20, unreadOnly = false } = {}) {
    try {
        let query = `
            SELECT * FROM notifications 
            WHERE tenant_id = $1
        `;
        const params = [tenant_id];

        if (unreadOnly) {
            query += ` AND is_read = false`;
        }

        query += ` ORDER BY created_at DESC LIMIT $${params.length + 1}`;
        params.push(limit);

        const res = await db.query(query, params);
        return res.rows;
    } catch (err) {
        logger.error('Failed to fetch notifications', { error: err.message, tenant_id });
        throw err;
    }
}

/**
 * Mark a notification as read
 */
async function markAsRead(id, tenant_id) {
    try {
        await db.query(
            `UPDATE notifications SET is_read = true WHERE id = $1 AND tenant_id = $2`,
            [id, tenant_id]
        );
    } catch (err) {
        logger.error('Failed to mark notification as read', { error: err.message, id, tenant_id });
        throw err;
    }
}

/**
 * Mark all notifications as read for a tenant
 */
async function markAllAsRead(tenant_id) {
    try {
        await db.query(
            `UPDATE notifications SET is_read = true WHERE tenant_id = $1 AND is_read = false`,
            [tenant_id]
        );
    } catch (err) {
        logger.error('Failed to mark all notifications as read', { error: err.message, tenant_id });
        throw err;
    }
}

module.exports = {
    createNotification,
    getNotifications,
    markAsRead,
    markAllAsRead
};
