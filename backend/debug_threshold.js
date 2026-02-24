const db = require('./src/config/database');
async function check() {
  try {
    const res = await db.query("SELECT id, name, min_stock_level FROM raw_materials ORDER BY id DESC LIMIT 5");
    console.log("DATA_START" + JSON.stringify(res.rows) + "DATA_END");
    
    const colRes = await db.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'raw_materials' AND column_name = 'min_stock_level'
    `);
    console.log("TYPE_START" + JSON.stringify(colRes.rows) + "TYPE_END");
    
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
check();
