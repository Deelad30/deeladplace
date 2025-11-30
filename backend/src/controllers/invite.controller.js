const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

async function inviteUser(req, res) {
  const inviter = req.user;
  const { email, role_name } = req.body;
  if (!inviter || !inviter.tenant_id) return res.status(403).json({ error: 'Tenant required' });

  // get role id
  const r = await db.query('SELECT id FROM roles WHERE name = $1 LIMIT 1', [role_name]);
  if (!r.rows[0]) return res.status(400).json({ error: 'Invalid role' });

  const token = uuidv4();

  await db.query(
    `INSERT INTO user_invites (tenant_id, email, invited_by, role_id, token) VALUES ($1,$2,$3,$4,$5)`,
    [inviter.tenant_id, email, inviter.userId || inviter.userId, r.rows[0].id, token]
  );

  // TODO: send email containing activation link (frontend url + token)
  // For now, return token for testing
  res.json({ ok: true, token });
}

async function acceptInvite(req, res) {
  const { token, password, name } = req.body;
  if (!token || !password) return res.status(400).json({ error: 'token & password required' });
  const inviteRes = await db.query('SELECT * FROM user_invites WHERE token = $1 AND status = $2 LIMIT 1', [token, 'pending']);
  const invite = inviteRes.rows[0];
  if (!invite) return res.status(400).json({ error: 'Invalid or expired token' });

  const password_hash = await bcrypt.hash(password, 10);
  // create user
  const userRes = await db.query(
    `INSERT INTO users (email, password_hash, name, role_id, tenant_id, status) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, email, tenant_id, role_id`,
    [invite.email, password_hash, name || invite.email.split('@')[0], invite.role_id, invite.tenant_id, 'active']
  );

  await db.query('UPDATE user_invites SET status = $1 WHERE id = $2', ['accepted', invite.id]);

  res.json({ ok: true, user: userRes.rows[0] });
}

module.exports = { inviteUser, acceptInvite };
