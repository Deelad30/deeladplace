const db = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const crypto = require('crypto');
const emailService = require('../utils/emailService');
const logger = require('../utils/logger');

dotenv.config();

// CRITICAL: JWT_SECRET must be set in environment variables
if (!process.env.JWT_SECRET) {
  throw new Error('SECURITY: JWT_SECRET environment variable is required. Please set it in your .env file or hosting platform.');
}
const JWT_SECRET = process.env.JWT_SECRET;

/**
 * ============================
 *        SIGNUP (TENANT)
 * ============================
 */
async function signup(req, res) {
  const { email, password, name, tenantName } = req.body;

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    const tenantRes = await client.query(
      `INSERT INTO tenants (name) VALUES ($1) RETURNING id, name`,
      [tenantName]
    );
    const tenant = tenantRes.rows[0];

    const password_hash = await bcrypt.hash(password, 10);

    const roleRes = await client.query(`SELECT id FROM roles WHERE name = 'admin' LIMIT 1`);
    const roleId = roleRes.rows[0].id;

    const userRes = await client.query(
      `INSERT INTO users (email, password_hash, name, role_id, tenant_id)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING id, email, name, tenant_id, role_id`,
      [email, password_hash, name, roleId, tenant.id]
    );
    const user = userRes.rows[0];

    await client.query('COMMIT');

    const token = jwt.sign(
      { userId: user.id, tenant_id: tenant.id, role_id: user.role_id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Optional: send welcome email
    emailService.sendWelcomeEmail(user).catch(err =>
      logger.error("Failed to send welcome email", { error: err.message, userId: user.id })
    );

    res.json({ token, user, tenant });

  } catch (err) {
    await client.query('ROLLBACK');
    logger.error('Signup failed', { error: err.message, email });
    res.status(500).json({ error: 'Signup failed', details: err.message });
  } finally {
    client.release();
  }
}

/**
 * ============================
 *        LOGIN
 * ============================
 */
async function login(req, res) {
  const { email, password } = req.body;

  try {
    const result = await db.query(
      `SELECT id, email, password_hash, name, tenant_id, role_id,
              plan_type, subscription_code, status
       FROM users
       WHERE email = $1`,
      [email]
    );

    const user = result.rows[0];
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    // 🔥 BLOCK INACTIVE USERS
    if (user.status !== 'active') {
      return res.status(403).json({ error: "Your account has been deactivated" });
    }

    const ok = await bcrypt.compare(password, user.password_hash || '');
    if (!ok) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { userId: user.id, tenant_id: user.tenant_id, role_id: user.role_id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Non-blocking email notification
    emailService.sendLoginNotification(user, new Date().toLocaleString())
      .catch(err => logger.error('Failed to send login notification', { error: err.message, userId: user.id }));

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        tenant_id: user.tenant_id,
        role_id: user.role_id,
        plan: user.plan_type,
        subscription_code: user.subscription_code,
        status:user.status
      }
    });

  } catch (err) {
    logger.error('Login failed', { error: err.message, email });
    res.status(500).json({ error: 'Login failed' });
  }
}


/**
 * ============================
 *     FORGOT PASSWORD
 * ============================
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const userResult = await db.query(
      'SELECT id, email, name FROM users WHERE email = $1',
      [email]
    );
  

    if (userResult.rows.length === 0) {
      return res.json({
        success: true,
        message: 'If an account exists, a reset email was sent'
      });
    }

    const user = userResult.rows[0];

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expiry = new Date(Date.now() + 60 * 60 * 1000); 

    await db.query(
      `UPDATE users 
       SET reset_token = $1, reset_token_expiry = $2
       WHERE id = $3`,
      [hashedToken, expiry, user.id]
    );

    // Send email with real token
    await emailService.sendPasswordResetEmail(user, resetToken);

    res.json({
      success: true,
      message: 'If an account exists, a password reset link has been sent'
    });

  } catch (error) {
    logger.error('Forgot password error', { error: error.message, email });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * ============================
 *      RESET PASSWORD
 * ============================
 */
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Hash the token to match the one stored in DB
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Fetch user including their email
    const userResult = await db.query(
      `SELECT id, email FROM users 
       WHERE reset_token = $1 AND reset_token_expiry > $2`,
      [hashedToken, new Date()]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    const user = userResult.rows[0];

    // Hash the new password
    const newHash = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    await db.query(
      `UPDATE users 
       SET password_hash = $1, reset_token = NULL, reset_token_expiry = NULL
       WHERE id = $2`,
      [newHash, user.id]
    );

    logger.info('Password reset successful', { email: user.email });

    // Send confirmation email
    await emailService.sendPasswordResetConfirmation(user)
      .catch(err => logger.error('Failed to send reset confirmation email', { error: err.message, userId: user.id }));

    res.json({ success: true, message: 'Password reset successfully' });

  } catch (error) {
    logger.error('Reset password error', { error: error.message });
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


module.exports = {
  signup,
  login,
  forgotPassword,
  resetPassword,
};
