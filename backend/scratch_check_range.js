require('dotenv').config({ path: './.env' });
const db = require('./src/config/database');

async function checkRange() {
  try {
    const tenantId = 23;
    const sql = `
      SELECT
        (ps.created_at AT TIME ZONE 'Africa/Lagos')::date AS date,
        COALESCE(SUM(ps.qty * (ps.selling_price + ps.commission)), 0) AS revenue,
        COUNT(*) as count
      FROM pos_sales ps
      WHERE ps.tenant_id = $1
        AND ps.created_at > NOW() - INTERVAL '48 hours'
      GROUP BY 1
      ORDER BY 1 DESC
    `;
    
    const res = await db.query(sql, [tenantId]);
    console.log('Revenue by Date (Lagos Time):');
    console.log(JSON.stringify(res.rows, null, 2));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkRange();
