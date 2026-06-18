const db = require('./src/config/database');

async function testTimezoneUsage() {
    try {
        console.log('Testing timezone-aware expected usage query...');

        // 1. Get a sample material and tenant
        const sampleRes = await db.query(`
      SELECT m.id AS material_id, m.tenant_id, r.product_id
      FROM raw_materials m
      JOIN recipes r ON r.material_id = m.id
      LIMIT 1
    `);

        if (sampleRes.rows.length === 0) {
            console.log('No materials with recipes found to test.');
            return;
        }

        const { material_id, tenant_id, product_id } = sampleRes.rows[0];
        const testDate = new Date().toISOString().split('T')[0];

        console.log(`Using material: ${material_id}, tenant: ${tenant_id}, product: ${product_id}, date: ${testDate}`);

        // 2. Test the query logic
        const query = `
      SELECT COALESCE(SUM(r.recipe_qty * ps.qty), 0) AS expected_usage
      FROM recipes r
      JOIN pos_sales ps ON ps.product_id = r.product_id
      WHERE r.material_id = $1
        AND ps.tenant_id = $2
        AND (ps.created_at AT TIME ZONE 'Africa/Lagos')::date = $3::date
    `;

        const result = await db.query(query, [material_id, tenant_id, testDate]);
        console.log('Query result (expected_usage):', result.rows[0].expected_usage);

        // 3. Verify that sales near midnight are handled correctly
        // We can't easily insert mock data without risking DB pollution, 
        // but we can check if the query syntax itself is valid and runs without error.
        console.log('Query executed successfully.');

    } catch (err) {
        console.error('Verification failed:', err);
    } finally {
        process.exit();
    }
}

testTimezoneUsage();
