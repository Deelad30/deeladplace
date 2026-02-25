const db = require('./src/config/database');

async function clearDemoData() {
  const tenantId = 27; 
  console.log(`Starting cleanup for Tenant ID: ${tenantId}`);

  // Refined order to ensure we clear child records before parents
  const tables = [
    'active_bills',
    'stock_movements',
    'inventory_movements',
    'pos_sales',
    'sales',
    'recipes', 
    'product_pricing_overrides',
    'product_packaging',
    'product_labour',
    'product_opex',
    'standard_costs',
    'packaging',
    'products',
    'stock_balance',
    'cost_variances',
    'material_purchases',
    'labour_costs',
    'opex_items',
    'expenses',
    'raw_materials',
    'vendors',
    'pos_shifts',
    'user_invites',
    'sic_products',
    'sic_raw_materials',
    'stock_items',
    'categories'
  ];

  try {
    await db.query('BEGIN');

    for (const table of tables) {
      try {
        const result = await db.query(`DELETE FROM ${table} WHERE tenant_id = $1`, [tenantId]);
        console.log(`- ${table}: Deleted ${result.rowCount} records`);
      } catch (e) {
        // Some tables might not have tenant_id or might fail - log but continue within transaction if possible
        // or just log if we decided not to fail the whole thing
        console.warn(`- ${table}: Error - ${e.message}`);
      }
    }

    await db.query('COMMIT');
    console.log('Cleanup completed successfully');
  } catch (err) {
    await db.query('ROLLBACK');
    console.error('Cleanup failed drastically, rolled back all:', err);
  } finally {
    process.exit(0);
  }
}

clearDemoData();
