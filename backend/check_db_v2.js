const db = require('./src/config/database');

async function checkMaterials() {
  try {
    // Check columns first
    const cols = await db.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'raw_materials'`);
    console.log('Columns:', cols.rows.map(r => r.column_name));

    // Then try to select
    const res = await db.query('SELECT * FROM raw_materials ORDER BY updated_at DESC LIMIT 5');
    console.table(res.rows);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkMaterials();
