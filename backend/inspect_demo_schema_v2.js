const db = require('./src/config/database');
const fs = require('fs');

async function inspectSchema() {
  try {
    const userRes = await db.query('SELECT * FROM users WHERE email = $1', ['demo@deesoftwork.com.ng']);
    if (userRes.rows.length === 0) {
      console.log(JSON.stringify({ error: 'User not found' }));
      return;
    }
    const user = userRes.rows[0];
    const tenantId = user.tenant_id;

    const tablesWithTenantId = await db.query(`
      SELECT table_name 
      FROM information_schema.columns 
      WHERE column_name = 'tenant_id' 
      AND table_schema = 'public'
    `);

    const results = {
      user_id: user.id,
      tenant_id: tenantId,
      tables: {}
    };

    for (const row of tablesWithTenantId.rows) {
      const countRes = await db.query(`SELECT COUNT(*) FROM ${row.table_name} WHERE tenant_id = $1`, [tenantId]);
      results.tables[row.table_name] = parseInt(countRes.rows[0].count);
    }

    fs.writeFileSync('inspection_data.json', JSON.stringify(results, null, 2));
    console.log('SUCCESS: Data written to inspection_data.json');

  } catch (err) {
    console.error('Error inspecting schema:', err);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

inspectSchema();
