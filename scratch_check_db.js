const db = require('./backend/src/config/database');
async function check() {
  try {
    const res = await db.query('SELECT SUM(qty * selling_price) as base, SUM(qty * commission) as comm FROM pos_sales');
    console.log(res.rows[0]);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
check();
