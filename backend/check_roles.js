const db = require('./src/config/database');

async function checkUsers() {
  try {
    const roles = await db.query('SELECT * FROM roles');
    console.log('--- ROLES ---');
    console.table(roles.rows);

    const users = await db.query('SELECT id, name, email, role_id, tenant_id FROM users ORDER BY id DESC LIMIT 20');
    console.log('\n--- RECENT USERS ---');
    console.table(users.rows);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkUsers();
