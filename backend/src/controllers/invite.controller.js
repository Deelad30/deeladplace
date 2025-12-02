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
  const inviter = req.user;
  const { email, role_name } = req.body;

  if (!inviter || !inviter.tenant_id)
    return res.status(403).json({ error: 'Tenant required' });

  // Fetch inviter full details (including plan)
  const inviterRes = await db.query(
    `SELECT plan_type, subscription_code, email, name 
     FROM users WHERE id = $1`,
    [inviter.userId]
  );
  const inviterUser = inviterRes.rows[0];

  // Get role ID
  const roleRes = await db.query(
    'SELECT id FROM roles WHERE name = $1 LIMIT 1',
    [role_name]
  );
  if (!roleRes.rows[0])
    return res.status(400).json({ error: 'Invalid role' });

  const token = uuidv4();

  // Insert invite
  await db.query(
    `INSERT INTO user_invites 
      (tenant_id, email, invited_by, role_id, token, plan_type, subscription_code) 
     VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    [
      inviter.tenant_id,
      email,
      inviter.userId,
      roleRes.rows[0].id,
      token,
      inviterUser.plan_type,
      inviterUser.subscription_code
    ]
  );

  // Send Invitation Email
  await emailService.sendInviteEmail({
    email,
    inviterName: inviterUser.name,
    inviterEmail: inviterUser.email,
    inviteLink: `${process.env.CLIENT_URL}/accept-invite?token=${token}`
  });

  res.json({ ok: true, message: "Invite sent successfully" });
}

/**
 * ============================
 *     ACCEPT INVITE
 * ============================
 */
async function acceptInvite(req, res) {
  const { token, password, name } = req.body;

  if (!token || !password)
    return res.status(400).json({ error: 'token & password required' });

  const inviteRes = await db.query(
    `SELECT * FROM user_invites 
     WHERE token = $1 AND status = $2 LIMIT 1`,
    [token, 'pending']
  );

  const invite = inviteRes.rows[0];
  if (!invite)
    return res.status(400).json({ error: 'Invalid or expired token' });

  const password_hash = await bcrypt.hash(password, 10);

  // Create user with inherited plan & subscription
  const userRes = await db.query(
    `INSERT INTO users 
      (email, password_hash, name, role_id, tenant_id, status, plan_type, subscription_code) 
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     RETURNING id, email, tenant_id, role_id, plan_type, subscription_code`,
    [
      invite.email,
      password_hash,
      name || invite.email.split('@')[0],
      invite.role_id,
      invite.tenant_id,
      'active',
      invite.plan_type,
      invite.subscription_code
    ]
  );

  await db.query(
    `UPDATE user_invites SET status = $1 WHERE id = $2`,
    ['accepted', invite.id]
  );

  // Send acceptance email
  await emailService.sendInviteAcceptedEmail({
    email: invite.email,
    name,
    tenantId: invite.tenant_id
  });

  res.json({ ok: true, user: userRes.rows[0] });
}

module.exports = { inviteUser, acceptInvite };
