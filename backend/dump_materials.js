const db = require('./src/config/database');

async function dumpTable() {
  try {
    console.log('--- SCHEMA ---');
    const schema = await db.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'raw_materials'
    `);
    console.table(schema.rows);

    console.log('--- DATA (First 5) ---');
    const data = await db.query('SELECT * FROM raw_materials ORDER BY id DESC LIMIT 5');
    console.table(data.rows);
    
    process.exit(0);
  } catch (err) {
    console.error('ERROR:', err.message);
    process.exit(1);
  }
}

dumpTable();
