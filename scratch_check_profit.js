const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });
const db = require('./backend/src/config/database');

async function checkExpenses() {
    try {
        const res = await db.query(`
      SELECT status, COUNT(*), SUM(amount::numeric) as total_amount
      FROM expenses
      GROUP BY status
    `);
        console.log('Expense Summary by Status:');
        console.log(JSON.stringify(res.rows, null, 2));

        const profitRes = await db.query(`
      SELECT 
        SUM(ps.qty * (ps.selling_price + ps.commission)) - SUM(ps.qty * COALESCE(sc.tcop, 0)) as gross_profit
      FROM pos_sales ps
      LEFT JOIN (
        SELECT DISTINCT ON (product_id) product_id, tcop
        FROM standard_costs
        ORDER BY product_id, created_at DESC
      ) sc ON ps.product_id = sc.product_id
    `);
        console.log('\nOverall Gross Profit:');
        console.log(JSON.stringify(profitRes.rows, null, 2));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkExpenses();
