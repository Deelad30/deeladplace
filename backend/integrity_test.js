const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const db = require('./src/config/database');

async function runIntegrityTest() {
  const d = '2026-01-16'; // Test Date

  console.log('--- STARTING DYNAMIC INTEGRITY TEST ---');

  try {
    // 1. FIND A TENANT WITH BOTH PRODUCTS AND MATERIALS
    const tenantSearch = await db.query(`
      SELECT p.tenant_id, p.id as product_id, p.name as product_name, m.id as material_id, m.name as material_name
      FROM products p
      JOIN raw_materials m ON m.tenant_id = p.tenant_id
      WHERE p.tenant_id IS NOT NULL
      LIMIT 1
    `);

    if (tenantSearch.rows.length === 0) {
      console.log('❌ Could not find a tenant with both products and materials');
      process.exit(1);
    }

    const { tenant_id: t, product_id: p, product_name: productName, material_id: m, material_name: materialName } = tenantSearch.rows[0];

    // Find a user for this tenant
    const userRes = await db.query('SELECT id FROM users WHERE tenant_id=$1 LIMIT 1', [t]);
    if (userRes.rows.length === 0) {
      console.log(`❌ No users found for Tenant ${t}`);
      process.exit(1);
    }
    const u = userRes.rows[0].id;

    console.log(`Using Tenant: ${t}, User: ${u}`);
    console.log(`Using Product: ${productName} (ID: ${p})`);
    console.log(`Using Material: ${materialName} (ID: ${m})`);

    // 2. CLEANUP
    console.log('Cleaning up old test data...');
    await db.query('DELETE FROM pos_sales WHERE tenant_id=$1 AND product_id=$2 AND DATE(created_at)=$3', [t, p, d]);
    await db.query('DELETE FROM sic_products WHERE tenant_id=$1 AND product_id=$2 AND date=$3', [t, p, d]);
    await db.query('DELETE FROM sic_raw_materials WHERE tenant_id=$1 AND material_id=$2 AND date=$3', [t, m, d]);

    // 3. SIMULATE POS SALE (5 units)
    await db.query(`
      INSERT INTO pos_sales (tenant_id, product_id, user_id, qty, selling_price, created_at)
      VALUES ($1, $2, $3, 5, 500, $4)
    `, [t, p, u, d + ' 12:00:00']);
    console.log(`✅ Simulated POS Sale: 5 ${productName}`);

    // 4. SIMULATE PRODUCT SIC (Physical count says 7 sold)
    await db.query(`
      INSERT INTO sic_products (tenant_id, product_id, date, opening_qty, issues_qty, waste_qty, closing_qty, expected_sales, system_sales, variance, created_by)
      VALUES ($1, $2, $3, 10, 0, 0, 3, 5, 7, -2, $4)
    `, [t, p, d, u]);
    console.log('✅ Simulated Product SIC: Physical Count says 7 sold');

    // 5. SIMULATE RAW MATERIAL SIC (Physical used 5)
    await db.query(`
      INSERT INTO sic_raw_materials (tenant_id, material_id, date, opening_qty, issues_qty, waste_qty, closing_qty, expected_usage, system_usage, variance, created_by)
      VALUES ($1, $2, $3, 10, 0, 0, 5, 2.5, 5, -2.5, $4)
    `, [t, m, d, u]);
    console.log('✅ Simulated Raw SIC: Physical Usage is 5');

    console.log('\n--- FETCHING VARIANCE RESULTS ---');

    // TEST PRODUCT VARIANCE
    const prodVar = await db.query(`
      SELECT
        p.name AS product_name,
        COALESCE(SUM(sp.expected_sales), 0) AS expected_sales_qty,
        COALESCE(SUM(sp.system_sales), 0) AS actual_sales_qty
      FROM products p
      LEFT JOIN sic_products sp ON sp.product_id = p.id AND sp.tenant_id = $1 AND sp.date = $2
      WHERE p.id = $3
      GROUP BY p.id, p.name
    `, [t, d, p]);

    const pv = prodVar.rows[0];
    const pv_expected = Number(pv.expected_sales_qty);
    const pv_actual = Number(pv.actual_sales_qty);
    const pv_variance = pv_expected - pv_actual;
    console.log(`Product [${pv.product_name}]: Expected=${pv_expected}, Actual=${pv_actual}, Variance=${pv_variance}`);
    console.log(`Remark: ${pv_variance < 0 ? 'Missing sales' : (pv_variance > 0 ? 'Overring' : 'Good')}`);

    // TEST RAW VARIANCE
    const rawVar = await db.query(`
      SELECT
        m.name AS material_name,
        COALESCE((
          SELECT SUM(sr.system_usage)
          FROM sic_raw_materials sr
          WHERE sr.material_id = m.id AND sr.tenant_id = $1 AND sr.date = $2
        ), 0) AS actual_usage
      FROM raw_materials m
      WHERE m.id = $3
    `, [t, d, m]);

    const rv = rawVar.rows[0];
    const rv_expected = 2.5; 
    const rv_actual = Number(rv.actual_usage);
    const rv_variance = rv_expected - rv_actual;
    console.log(`Material [${rv.material_name}]: Expected=${rv_expected}, Actual=${rv_actual}, Variance=${rv_variance}`);
    console.log(`Remark: ${rv_variance < 0 ? 'Over usage / Missing' : (rv_variance > 0 ? 'Under usage' : 'Good')}`);

    console.log('--- INTEGRITY TEST COMPLETE ---');
    process.exit(0);
  } catch (err) {
    console.error('TEST_FAILED:', err);
    process.exit(1);
  }
}

runIntegrityTest();
