const db = require('./src/config/database');

async function check() {
  try {
    const res = await db.query("SELECT DISTINCT payment_method FROM pos_sales");
    console.log("METHODS:", res.rows.map(r => r.payment_method));
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}

check();
