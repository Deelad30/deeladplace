require('dotenv').config({ path: './.env' });
const db = require('./src/config/database');

async function checkRevenue() {
  try {
    const tenantId = 23; // From logs
    const date = '2026-04-24';
    
    const sql = `
      SELECT
        COALESCE(SUM(ps.qty * (ps.selling_price + ps.commission)), 0) AS total_revenue,
        COALESCE(SUM(ps.qty * ps.commission), 0) AS total_commission,
        COUNT(*) as count
      FROM pos_sales ps
      WHERE ps.tenant_id = $1
        AND (ps.created_at AT TIME ZONE 'Africa/Lagos')::date = $2::date
    `;
    
    const res = await db.query(sql, [tenantId, date]);
    console.log('Revenue for April 24 (Lagos Time):');
    console.log(JSON.stringify(res.rows[0], null, 2));
    
    const res2 = await db.query(sql, [tenantId, '2026-04-25']);
    console.log('Revenue for April 25 (Lagos Time):');
    console.log(JSON.stringify(res2.rows[0], null, 2));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkRevenue();
