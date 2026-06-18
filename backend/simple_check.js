const path = require('path');
require('dotenv').config();
const db = require('./src/config/database');

async function check() {
    const e = await db.query("SELECT status, SUM(amount::numeric) as total FROM expenses GROUP BY status");
    const p = await db.query(`SELECT 
        SUM(ps.qty * (ps.selling_price + ps.commission)) as rev,
        SUM(ps.qty * COALESCE(sc.tcop, 0)) as cost
      FROM pos_sales ps
      LEFT JOIN (SELECT DISTINCT ON (product_id) product_id, tcop FROM standard_costs ORDER BY product_id, created_at DESC) sc ON ps.product_id = sc.product_id`);

    console.log('RESULTS_START');
    console.log(JSON.stringify({ expenses: e.rows, profit: p.rows[0] }, null, 2));
    console.log('RESULTS_END');
    process.exit(0);
}
check();
