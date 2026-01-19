const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function check() {
  try {
    const res = await pool.query(`
      SELECT ps.id, p.name, ps.payment_breakdown
      FROM pos_sales ps
      JOIN products p ON ps.product_id = p.id
      WHERE ps.shift_id = 76
    `);
    res.rows.forEach(row => {
        console.log(`Sale ID: ${row.id} - ${row.name}`);
        console.log(JSON.stringify(row.payment_breakdown, null, 2));
    });

    await pool.end();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
