const db = require('./src/config/database');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

async function createDemoUser() {
  const client = await db.pool.connect();
  try {
    console.log('Starting Demo User Creation...');
    await client.query('BEGIN');

    // 1. Create Tenant
    const tenantRes = await client.query(
      `INSERT INTO tenants (name) VALUES ($1) RETURNING id`,
      ['Demo Store']
    );
    const tenantId = tenantRes.rows[0].id;
    console.log(`Created Tenant: ${tenantId}`);

    // 2. Get Admin Role ID
    const roleRes = await client.query(`SELECT id FROM roles WHERE name = 'admin' LIMIT 1`);
    if (roleRes.rows.length === 0) throw new Error("Admin role not found!");
    const roleId = roleRes.rows[0].id;

    // 3. Create User
    const email = 'demo@deesoftwork.com.ng';
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);
    const subscriptionCode = 'DEMO-' + uuidv4().substring(0, 8).toUpperCase();

    const userRes = await client.query(
      `INSERT INTO users (
          email, 
          password_hash, 
          name, 
          role_id, 
          tenant_id, 
          status,
          plan_type,
          subscription_code
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, email`,
      [
        email, 
        hashedPassword, 
        'Demo Admin', 
        roleId, 
        tenantId, 
        'active',
        'enterprise',
        subscriptionCode
      ]
    );

    await client.query('COMMIT');
    console.log('SUCCESS! Demo User Created:');
    console.log('Email:', userRes.rows[0].email);
    console.log('Password:', password);
    
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('FAILED:', err);
  } finally {
    client.release();
    process.exit();
  }
}

createDemoUser();
