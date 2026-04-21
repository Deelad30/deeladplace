const database = require('./src/config/database');
const Vendor = require('./src/models/Vendor');
const Expense = require('./src/models/Expense');
const Product = require('./src/models/Product');

async function runVerification() {
  console.log('--- Starting Vendor Soft-Deletion Verification ---');
  
  // 1. Find a tenant ID
  const tenantRes = await database.query('SELECT tenant_id FROM users LIMIT 1');
  if (tenantRes.rows.length === 0) {
    console.error('No tenants found in database');
    process.exit(1);
  }
  const tenantId = tenantRes.rows[0].tenant_id;
  console.log('Using tenant ID:', tenantId);

  // 2. Create a test vendor
  const originalName = 'Verification Vendor ' + Date.now();
  const vendor = await Vendor.create({
    name: originalName,
    description: 'Vendor for testing soft deletion',
    is_active: true,
    tenant_id: tenantId
  });
  console.log('Created test vendor:', vendor.id, vendor.name);

  // 3. Create a dependency (expense)
  const expense = await Expense.create({
    tenant_id: tenantId,
    description: 'Test Expense',
    amount: 100,
    category: 'General',
    supplier: originalName,
    vendor_id: vendor.id,
    expense_date: new Date()
  });
  console.log('Created test expense linked to vendor:', expense.id);

  // 4. Create a product linked to this vendor
  const product = await Product.create({
    tenant_id: tenantId,
    vendor_id: vendor.id,
    name: 'Test Product',
    sku: 'TEST-' + Date.now(),
    vendor_price: 50
  });
  console.log('Created test product linked to vendor:', product.id);

  // 5. Perform Soft Delete (Mimic the controller's transaction logic)
  console.log('Performing Soft Delete...');
  
  await database.query('BEGIN');
  try {
    // Soft delete the vendor
    await Vendor.delete(vendor.id, { tenantId });
    
    // Deactivate products
    await database.query(
      `UPDATE products SET is_active = false WHERE vendor_id = $1 AND tenant_id = $2`,
      [vendor.id, tenantId]
    );
    
    await database.query('COMMIT');
    console.log('Soft delete transaction committed.');
  } catch (err) {
    await database.query('ROLLBACK');
    console.error('Soft delete failed:', err);
    process.exit(1);
  }

  // 6. Verify Vendor state
  const vendorCheck = await database.query('SELECT * FROM vendors WHERE id = $1', [vendor.id]);
  const deletedVendor = vendorCheck.rows[0];
  console.log('Verifying vendor state:');
  console.log('- is_deleted:', deletedVendor.is_deleted);
  console.log('- New name:', deletedVendor.name);
  
  if (deletedVendor.is_deleted === true && deletedVendor.name.includes('[DELETED]')) {
    console.log('SUCCESS: Vendor soft-deleted and renamed correctly.');
  } else {
    console.error('FAIL: Vendor state incorrect.');
  }

  // 7. Verify Expense persistence
  const expenseCheck = await database.query('SELECT * FROM expenses WHERE id = $1', [expense.id]);
  if (expenseCheck.rows.length === 1) {
    console.log('SUCCESS: Expense record preserved.');
  } else {
    console.error('FAIL: Expense record missing!');
  }

  // 8. Verify Product deactivation
  const productCheck = await database.query('SELECT * FROM products WHERE id = $1', [product.id]);
  if (productCheck.rows[0].is_active === false) {
    console.log('SUCCESS: Product deactivated.');
  } else {
    console.error('FAIL: Product still active!');
  }

  // 9. Verify Vendor visibility in active lists
  const activeVendors = await Vendor.findAll({ tenantId });
  const isFound = activeVendors.some(v => v.id === vendor.id);
  if (!isFound) {
    console.log('SUCCESS: Deleted vendor not found in active list.');
  } else {
    console.error('FAIL: Deleted vendor still appears in active list!');
  }

  console.log('--- Verification Complete ---');
  process.exit(0);
}

runVerification().catch(err => {
  console.error('Error during verification:', err);
  process.exit(1);
});
