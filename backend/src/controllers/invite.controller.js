// src/controllers/invite.controller.js
const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const emailService = require('../utils/emailService');

/**
 * ============================
 *      INVITE USER
 * ============================
 */
async function inviteUser(req, res) {
  try {
    const inviter = req.user; // from auth middleware
    const { email, role_name } = req.body;

    if (!inviter || !inviter.tenant_id)
      return res.status(403).json({ error: 'Tenant required' });

    // Fetch inviter details (plan & subscription)
    const inviterRes = await db.query(
      `SELECT plan_type, subscription_code, email, name 
       FROM users WHERE id = $1`,
      [inviter.userId]
    );
    const inviterUser = inviterRes.rows[0];

    if (!inviterUser)
      return res.status(404).json({ error: 'Inviter not found' });

    // Get role ID
    const roleRes = await db.query(
      'SELECT id FROM roles WHERE name = $1 LIMIT 1',
      [role_name]
    );
    if (!roleRes.rows[0])
      return res.status(400).json({ error: 'Invalid role' });

    const roleId = roleRes.rows[0].id;

    // Check if a pending invite already exists for this email in the same tenant
    const pendingInviteRes = await db.query(
      'SELECT * FROM user_invites WHERE email = $1 AND tenant_id = $2 AND status = $3',
      [email, inviter.tenant_id, 'pending']
    );
    if (pendingInviteRes.rows.length > 0) {
      return res.status(400).json({ error: 'A pending invite already exists for this email' });
    }

    // Check if active user exists
    const activeUserRes = await db.query(
      'SELECT * FROM users WHERE email = $1 AND tenant_id = $2 AND status = $3',
      [email, inviter.tenant_id, 'active']
    );
    if (activeUserRes.rows.length > 0) {
      return res.status(400).json({ error: 'This user is already active' });
    }

    const token = uuidv4();

    // Insert invite
    await db.query(
      `INSERT INTO user_invites (
         tenant_id, email, invited_by, role_id, token, inviter_plan, inviter_subscription
       ) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [
        inviter.tenant_id,
        email,
        inviter.userId,
        roleId,
        token,
        inviterUser.plan_type,
        inviterUser.subscription_code
      ]
    );

    // Send invitation email
    await emailService.sendInviteEmail({
      email,
      inviterName: inviterUser.name,
      inviterEmail: inviterUser.email,
      inviteLink: `${process.env.CLIENT_URL}/accept-invite?token=${token}`
    });

    res.json({ ok: true, message: "Invite sent successfully" });
  } catch (err) {
    console.error("Invite Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}



/**
 * ============================
 *     ACCEPT INVITE
 * ============================
 */
async function acceptInvite(req, res) {
  try {
    const { token, password, name } = req.body;

    if (!token || !password)
      return res.status(400).json({ error: 'Token & password required' });

    // Find pending invite
    const inviteRes = await db.query(
      `SELECT * FROM user_invites 
       WHERE token = $1 AND status = 'pending'
       LIMIT 1`,
      [token]
    );

    const invite = inviteRes.rows[0];
    if (!invite)
      return res.status(400).json({ error: 'Invalid or expired invite token' });

    const password_hash = await bcrypt.hash(password, 10);
    const finalName = name || invite.email.split('@')[0];

    /**
     * ==========================================================
     * 1️⃣ CHECK IF USER ALREADY EXISTS (active or inactive)
     * ==========================================================
     */
    const existingUserRes = await db.query(
      `SELECT id, status FROM users 
       WHERE email = $1 AND tenant_id = $2`,
      [invite.email, invite.tenant_id]
    );

    const existingUser = existingUserRes.rows[0];

    /**
     * ==========================================================
     * 2️⃣ IF USER EXISTS AND IS INACTIVE → REACTIVATE THEM
     * ==========================================================
     */
    if (existingUser && existingUser.status === 'inactive') {
      const updatedUserRes = await db.query(
        `UPDATE users 
         SET password_hash = $1,
             name = $2,
             role_id = $3,
             status = 'active',
             plan_type = $4,
             subscription_code = $5
         WHERE id = $6
         RETURNING id, email, tenant_id, role_id, status`,
        [
          password_hash,
          finalName,
          invite.role_id,
          invite.inviter_plan,
          invite.inviter_subscription,
          existingUser.id
        ]
      );

      // Mark invite as accepted
      await db.query(
        `UPDATE user_invites SET status = 'accepted' WHERE id = $1`,
        [invite.id]
      );

      return res.json({
        ok: true,
        message: "User reactivated successfully",
        user: updatedUserRes.rows[0]
      });
    }

    /**
     * ==========================================================
     * 3️⃣ IF USER EXISTS AND IS ACTIVE → BLOCK
     * ==========================================================
     */
    if (existingUser && existingUser.status === 'active') {
      return res
        .status(400)
        .json({ error: 'User with this email already exists' });
    }

    /**
     * ==========================================================
     * 4️⃣ USER DOES NOT EXIST → CREATE NEW USER
     * ==========================================================
     */
    const newUserRes = await db.query(
      `INSERT INTO users (
         email, password_hash, name, role_id, tenant_id, status,
         plan_type, subscription_code
       ) VALUES ($1,$2,$3,$4,$5,'active',$6,$7)
       RETURNING id, email, tenant_id, role_id, status`,
      [
        invite.email,
        password_hash,
        finalName,
        invite.role_id,
        invite.tenant_id,
        invite.inviter_plan,
        invite.inviter_subscription
      ]
    );

    // Mark invite as accepted
    await db.query(
      `UPDATE user_invites SET status = 'accepted' WHERE id = $1`,
      [invite.id]
    );

    return res.json({
      ok: true,
      message: "User created successfully",
      user: newUserRes.rows[0]
    });

  } catch (err) {
    console.error("Accept Invite Error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}



/**
 * Get All Invites for the logged-in user
 */
async function getUserInvites(req, res) {
  try {
    const user = req.user;
    if (!user || !user.tenant_id)
      return res.status(403).json({ error: 'Tenant required' });

    const invitesRes = await db.query(
      `SELECT ui.id, ui.email, ui.status, r.name AS role_name, ui.created_at
       FROM user_invites ui
       JOIN roles r ON ui.role_id = r.id
       WHERE ui.tenant_id = $1
       ORDER BY ui.created_at DESC`,
      [user.tenant_id]
    );

    res.json({ ok: true, invites: invitesRes.rows });
  } catch (err) {
    console.error("Get Invites Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * Delete / Cancel an Invite
 */
async function cancelInvite(req, res) {
  try {
    const user = req.user;
    const { id } = req.params;

    if (!user || !user.tenant_id)
      return res.status(403).json({ error: 'Tenant required' });

    // Get the invite
    const inviteRes = await db.query(
      'SELECT * FROM user_invites WHERE id = $1 AND tenant_id = $2',
      [id, user.tenant_id]
    );

    const invite = inviteRes.rows[0];
    if (!invite) return res.status(404).json({ error: 'Invite not found' });

    // Check if user has already accepted
    if (invite.status === 'pending') {
      // If still pending, just mark invite as cancelled
      await db.query(
        'UPDATE user_invites SET status = $1 WHERE id = $2',
        ['cancelled', id]
      );
      return res.json({ ok: true, message: 'Pending invite cancelled successfully' });
    }

    // If already accepted, deactivate user account
    await db.query(
      'UPDATE users SET status = $1 WHERE email = $2 AND tenant_id = $3',
      ['inactive', invite.email, user.tenant_id]
    );

    // Optionally, mark invite as cancelled as well
    await db.query(
      'UPDATE user_invites SET status = $1 WHERE id = $2',
      ['cancelled', id]
    );

    res.json({ ok: true, message: 'User access revoked and invite cancelled' });
  } catch (err) {
    console.error("Cancel Invite Error:", err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function deleteInvite(req, res) {
  try {
    const user = req.user;
    const { id } = req.params;

    if (!user || !user.tenant_id)
      return res.status(403).json({ error: 'Tenant required' });

    // Only allow deleting cancelled invites
    const inviteRes = await db.query(
      'SELECT * FROM user_invites WHERE id = $1 AND tenant_id = $2 AND status = $3',
      [id, user.tenant_id, 'cancelled']
    );

    if (!inviteRes.rows[0])
      return res.status(404).json({ error: 'Cancelled invite not found' });

    await db.query('DELETE FROM user_invites WHERE id = $1', [id]);

    res.json({ ok: true, message: 'Cancelled invite deleted successfully' });
  } catch (err) {
    console.error("Delete Invite Error:", err);
    res.status(500).json({ error: 'Internal server error' });
  }
}


module.exports = { inviteUser, acceptInvite, getUserInvites, cancelInvite, deleteInvite };
