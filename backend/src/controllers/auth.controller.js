const db = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const crypto = require('crypto');
const emailService = require('../utils/emailService');

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

/**
 * ============================
 *        SIGNUP (TENANT)
 * ============================
 */
async function signup(req, res) {
  const { email, password, name, tenantName } = req.body;
  if (!email || !password || !tenantName) {
    return res.status(400).json({ error: 'email, password and tenantName required' });
  }

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
      console.error("Failed to send welcome email:", err)
    );

    res.json({ token, user, tenant });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
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
  if (!email || !password) return res.status(400).json({ error: 'Missing credentials' });

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
      .catch(err => console.error('Failed to send login notification:', err));

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
    console.error(err);
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

    if (!email)
      return res.status(400).json({ success: false, message: 'Email is required' });

    const userResult = await db.query(
      'SELECT id, email, name FROM users WHERE email = $1',
      [email]
    );

    console.log(userResult);
  
    

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
    console.error('Forgot password error:', error);
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

    if (!token || !newPassword)
      return res.status(400).json({ success: false, message: 'Token and new password are required' });

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const userResult = await db.query(
      `SELECT id FROM users 
       WHERE reset_token = $1 AND reset_token_expiry > $2`,
      [hashedToken, new Date()]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    const user = userResult.rows[0];
    const newHash = await bcrypt.hash(newPassword, 10);

    await db.query(
      `UPDATE users 
       SET password_hash = $1, reset_token = NULL, reset_token_expiry = NULL
       WHERE id = $2`,
      [newHash, user.id]
    );

    // Send confirmation email
    emailService.sendPasswordResetConfirmation(user, new Date().toLocaleString())
      .catch(err => console.error('Failed to send reset confirmation email:', err));

    res.json({ success: true, message: 'Password reset successfully' });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  signup,
  login,
  forgotPassword,
  resetPassword,
};
