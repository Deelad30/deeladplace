const db = require('./src/config/database');
async function check() {
  try {
    const res = await db.query(`
      SELECT column_name
      FROM information_schema.columns 
      WHERE table_name = 'sales'
    `);
    console.log("COLUMNS IN SALES TABLE:");
    res.rows.forEach(r => console.log("- " + r.column_name));
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
check();
