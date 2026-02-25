const db = require('./src/config/database');

async function inspectSchema() {
  try {
    // Find user and their tenant_id
    const userRes = await db.query('SELECT * FROM users WHERE email = $1', ['demo@deesoftwork.com.ng']);
    if (userRes.rows.length === 0) {
      console.log('User not found');
      return;
    }
    const user = userRes.rows[0];
    const tenantId = user.tenant_id;
    console.log(`User ID: ${user.id}, Tenant ID: ${tenantId}`);

    // Get all tables and columns that have tenant_id
    const tablesWithTenantId = await db.query(`
      SELECT table_name 
      FROM information_schema.columns 
      WHERE column_name = 'tenant_id' 
      AND table_schema = 'public'
    `);

    console.log('Tables with tenant_id:');
    for (const row of tablesWithTenantId.rows) {
      const countRes = await db.query(`SELECT COUNT(*) FROM ${row.table_name} WHERE tenant_id = $1`, [tenantId]);
      console.log(`- ${row.table_name}: ${countRes.rows[0].count} records`);
    }

  } catch (err) {
    console.error('Error inspecting schema:', err);
  } finally {
    process.exit(0);
  }
}

inspectSchema();
