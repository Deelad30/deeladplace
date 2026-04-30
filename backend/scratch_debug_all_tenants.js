const db = require('./src/config/database');

async function debugAllTenantsProfit() {
  try {
    const lagosNow = new Date().toLocaleString("en-US", {timeZone: "Africa/Lagos"});
    const d = new Date(lagosNow);
    const today = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    
    console.log('Debugging Profit for all tenants on date:', today);

    const tenantsSql = `SELECT DISTINCT tenant_id FROM pos_sales WHERE (created_at AT TIME ZONE 'Africa/Lagos')::date = $1::date`;
    const tenantsRes = await db.query(tenantsSql, [today]);
    const tenants = tenantsRes.rows.map(r => r.tenant_id);

    for (const tenantId of tenants) {
        console.log(`--- Tenant ID: ${tenantId} ---`);
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

        const salesSql = `SELECT count(*), sum(qty * (selling_price + commission)) as revenue FROM pos_sales WHERE tenant_id = $1 AND (created_at AT TIME ZONE 'Africa/Lagos')::date = $2::date`;
        const salesRes = await db.query(salesSql, [tenantId, today]);
        console.log('Sales Count/Revenue:', salesRes.rows[0]);
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

debugAllTenantsProfit();
