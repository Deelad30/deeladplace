const path = require('path');
require('dotenv').config();
const db = require('./src/config/database');

async function checkExpenses() {
    try {
        const res = await db.query(`
      SELECT status, SUM(amount::numeric) as total_amount
      FROM expenses
      GROUP BY status
    `);

        console.log('--- EXPENSES ---');
        res.rows.forEach(row => {
            console.log(`Status: ${row.status}, Total: ${row.total_amount}`);
        });

        const profitRes = await db.query(`
      SELECT 
        SUM(ps.qty * (ps.selling_price + ps.commission)) as revenue,
        SUM(ps.qty * COALESCE(sc.tcop, 0)) as cost,
        SUM(ps.qty * (ps.selling_price + ps.commission)) - SUM(ps.qty * COALESCE(sc.tcop, 0)) as gross_profit
      FROM pos_sales ps
      LEFT JOIN (
        SELECT DISTINCT ON (product_id) product_id, tcop
        FROM standard_costs
        ORDER BY product_id, created_at DESC
      ) sc ON ps.product_id = sc.product_id
    `);

        console.log('\n--- PROFIT ---');
        const p = profitRes.rows[0];
        console.log(`Revenue: ${p.revenue}`);
        console.log(`Cost: ${p.cost}`);
        console.log(`Gross Profit: ${p.gross_profit}`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkExpenses();
