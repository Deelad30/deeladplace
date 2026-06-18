const db = require('./src/config/database');

async function check() {
    try {
        const tenantIdRes = await db.query('SELECT DISTINCT tenant_id FROM pos_sales LIMIT 5');
        console.log('Sample tenant IDs in pos_sales:', tenantIdRes.rows);

        if (tenantIdRes.rows.length > 0) {
            const tid = tenantIdRes.rows[0].tenant_id;
            console.log('Checking for tenant:', tid);

            const salesRes = await db.query('SELECT COUNT(*) FROM pos_sales WHERE tenant_id = $1', [tid]);
            console.log('Total sales for tenant:', salesRes.rows[0].count);

            const recipeRes = await db.query('SELECT COUNT(*) FROM recipes');
            console.log('Total recipes in DB:', recipeRes.rows[0].count);

            const recipesWithTid = await db.query('SELECT COUNT(*) FROM recipes WHERE tenant_id = $1', [tid]).catch(e => ({ error: e.message }));
            console.log('Recipes with tenant_id filter:', recipesWithTid.rows ? recipesWithTid.rows[0].count : recipesWithTid.error);

            const joinRes = await db.query(`
        SELECT r.material_id, COUNT(*) 
        FROM recipes r
        JOIN pos_sales ps ON ps.product_id = r.product_id
        WHERE ps.tenant_id = $1
        GROUP BY r.material_id
        LIMIT 5
      `, [tid]);
            console.log('Join results (material_id, count):', joinRes.rows);
        }
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

check();
