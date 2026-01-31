const db = require('./src/config/database');

async function checkSchema() {
  try {
    const res = await db.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'tenants'");
    console.log("TENANTS COLUMNS:");
    res.rows.forEach(r => console.log(`${r.column_name} (${r.data_type})`));
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}

checkSchema();
