const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const db = require('./src/config/database');

async function testNetProfitKPI() {
  const t = 19; // Tenant ID
  const d = '2026-01-16'; // Test Date

  console.log('--- TESTING NET PROFIT KPI ---');

  try {
    const res = await db.query(`
      WITH product_profit AS (
        SELECT 
          COALESCE(SUM(ps.qty * ps.selling_price) - SUM(ps.qty * COALESCE(sc_latest.tcop, 0)), 0) AS total_product_profit,
          COALESCE(SUM(ps.qty * ps.selling_price), 0) AS total_sales
        FROM pos_sales ps
        JOIN products p ON p.id = ps.product_id
        LEFT JOIN LATERAL (
          SELECT sc.tcop
          FROM standard_costs sc
          WHERE sc.product_id = p.id
            AND sc.tenant_id = ps.tenant_id
          ORDER BY sc.created_at DESC
          LIMIT 1
        ) sc_latest ON true
        WHERE ps.tenant_id = $1 AND DATE(ps.created_at) = $2
      ),
      expenses AS (
        SELECT COALESCE(SUM(amount), 0) AS total_expenses
        FROM expenses
        WHERE tenant_id = $1 AND DATE(expense_date) = $2
      )
      SELECT
        pp.total_sales,
        pp.total_product_profit,
        e.total_expenses,
        (pp.total_product_profit - e.total_expenses) AS net_profit
      FROM product_profit pp, expenses e;
    `, [t, d]);

    console.log('Summary Result:', res.rows[0]);
    
    if (res.rows[0].total_product_profit !== undefined) {
        console.log('✅ total_product_profit is present and calculated');
    } else {
        console.log('❌ total_product_profit MISSING');
    }

    process.exit(0);
  } catch (err) {
    console.error('TEST_FAILED:', err);
    process.exit(1);
  }
}

testNetProfitKPI();
