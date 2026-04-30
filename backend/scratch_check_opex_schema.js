const db = require('./src/config/database');

async function checkSchema() {
  try {
    const res = await db.query("SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'opex_items'");
    console.log("OPEX_ITEMS COLUMNS:");
    res.rows.forEach(r => console.log(`${r.column_name} (${r.data_type}) - Nullable: ${r.is_nullable}`));
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}

checkSchema();
