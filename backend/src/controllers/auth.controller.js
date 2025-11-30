const db = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

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

    // default role = admin
    const roleRes = await client.query(`SELECT id FROM roles WHERE name = 'admin' LIMIT 1`);
    const roleId = roleRes.rows[0].id;

    const userRes = await client.query(
      `INSERT INTO users (email, password_hash, name, role_id, tenant_id) VALUES ($1,$2,$3,$4,$5) RETURNING id, email, name, tenant_id, role_id`,
      [email, password_hash, name, roleId, tenant.id]
    );
    const user = userRes.rows[0];

    await client.query('COMMIT');

    const token = jwt.sign(
      { userId: user.id, tenant_id: tenant.id, role_id: user.role_id },
      JWT_SECRET,
      { expiresIn: '7d' }
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

async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing credentials' });

  try {
    const result = await db.query('SELECT id, email, password_hash, name, tenant_id, role_id FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password_hash || '');
    if (!ok) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: user.id, tenant_id: user.tenant_id, role_id: user.role_id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, tenant_id: user.tenant_id, role_id: user.role_id }});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
}

module.exports = { signup, login };
