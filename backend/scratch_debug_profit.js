const db = require('./src/config/database');

async function debugProfit() {
  try {
    const lagosNow = new Date().toLocaleString("en-US", {timeZone: "Africa/Lagos"});
    const d = new Date(lagosNow);
    const today = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    
    console.log('Debugging Profit for date:', today);

    // 1. Check sales for today
    const salesSql = `
      SELECT ps.id, ps.tenant_id, ps.product_id, ps.qty, ps.selling_price, ps.commission, ps.created_at
      FROM pos_sales ps
      WHERE (ps.created_at AT TIME ZONE 'Africa/Lagos')::date = $1::date
      ORDER BY ps.created_at DESC
      LIMIT 5
    `;
    const salesRes = await db.query(salesSql, [today]);
    console.log('Recent Sales:', JSON.stringify(salesRes.rows, null, 2));

    if (salesRes.rows.length > 0) {
        const tenantId = salesRes.rows[0].tenant_id;
        console.log('Testing for Tenant ID:', tenantId);

        // 2. Run the exact profit query for this tenant
        const profitSql = `
            SELECT
                COALESCE(SUM((ps.qty * (ps.selling_price + ps.commission)) - (ps.qty * COALESCE(sc_latest.tcop,0))), 0) AS total_profit
            FROM pos_sales ps
            LEFT JOIN products p ON p.id = ps.product_id
            LEFT JOIN LATERAL (
                SELECT sc.tcop
                FROM standard_costs sc
                WHERE sc.product_id = p.id AND sc.tenant_id = ps.tenant_id
                ORDER BY sc.created_at DESC
                LIMIT 1
            ) sc_latest ON true
            WHERE ps.tenant_id = $1
            AND (ps.created_at AT TIME ZONE 'Africa/Lagos')::date = $2::date
        `;
        const profitRes = await db.query(profitSql, [tenantId, today]);
        console.log('Profit Result:', profitRes.rows[0]);

        // 3. Check if standard_costs exist for these products
        const productIds = salesRes.rows.map(r => r.product_id).filter(id => id !== null);
        if (productIds.length > 0) {
            const scSql = `SELECT product_id, tcop, tenant_id FROM standard_costs WHERE product_id = ANY($1) AND tenant_id = $2`;
            const scRes = await db.query(scSql, [productIds, tenantId]);
            console.log('Standard Costs Found:', scRes.rows);
        }
    } else {
        console.log('No sales found for today in the database.');
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

debugProfit();
