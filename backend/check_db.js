const db = require('./src/config/database');

async function checkMaterials() {
  try {
    const res = await db.query('SELECT id, name, min_stock_level FROM raw_materials ORDER BY updated_at DESC LIMIT 5');
    console.table(res.rows);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkMaterials();
