const db = require('./src/config/database');

async function forceUpdate() {
  try {
    console.log('--- UPDATING ---');
    // Tiger Nuts is usually 343 based on previous dump
    const res1 = await db.query('UPDATE raw_materials SET min_stock_level = 80 WHERE name ILIKE \'%Tiger Nuts%\' RETURNING *');
    console.log('Tiger Nuts Update:', res1.rows);

    const res2 = await db.query('UPDATE raw_materials SET min_stock_level = 3 WHERE name ILIKE \'%Ginger%\' RETURNING *');
    console.log('Ginger Update:', res2.rows);

    console.log('--- FINAL STATE ---');
    const final = await db.query('SELECT id, name, min_stock_level, tenant_id FROM raw_materials WHERE name ILIKE \'%Tiger Nuts%\' OR name ILIKE \'%Ginger%\'');
    console.table(final.rows);
    
    process.exit(0);
  } catch (err) {
    console.error('ERROR:', err.message);
    process.exit(1);
  }
}

forceUpdate();
