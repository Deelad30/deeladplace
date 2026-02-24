const fs = require('fs');
const db = require('./src/config/database');

async function dumpTable() {
  try {
    let output = '';
    output += '--- SCHEMA ---\n';
    const schema = await db.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'raw_materials'
    `);
    output += JSON.stringify(schema.rows, null, 2) + '\n';

    output += '--- DATA (First 10) ---\n';
    const data = await db.query('SELECT id, name, min_stock_level, measurement_unit FROM raw_materials ORDER BY id DESC LIMIT 10');
    output += JSON.stringify(data.rows, null, 2) + '\n';
    
    fs.writeFileSync('dump_output.txt', output);
    process.exit(0);
  } catch (err) {
    fs.writeFileSync('dump_output.txt', 'ERROR: ' + err.message);
    process.exit(1);
  }
}

dumpTable();
