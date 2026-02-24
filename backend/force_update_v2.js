const fs = require('fs');
const db = require('./src/config/database');

async function forceUpdate() {
  try {
    // 1. Update
    await db.query("UPDATE raw_materials SET min_stock_level = 80 WHERE name ILIKE '%Tiger Nuts%'");
    await db.query("UPDATE raw_materials SET min_stock_level = 3 WHERE name ILIKE '%Ginger%'");

    // 2. Dump
    const res = await db.query("SELECT id, name, min_stock_level, tenant_id FROM raw_materials WHERE name ILIKE '%Tiger Nuts%' OR name ILIKE '%Ginger%'");
    fs.writeFileSync('force_dump.json', JSON.stringify(res.rows, null, 2));
    process.exit(0);
  } catch (err) {
    fs.writeFileSync('force_dump.json', 'ERROR: ' + err.message);
    process.exit(1);
  }
}

forceUpdate();
