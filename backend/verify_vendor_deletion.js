const database = require('./src/config/database');
const Vendor = require('./src/models/Vendor');
const Expense = require('./src/models/Expense');

async function runTest() {
  console.log('--- Starting Vendor Deletion Error Verification ---');
  
  // 1. Find a tenant ID
  const tenantRes = await database.query('SELECT tenant_id FROM users LIMIT 1');
  if (tenantRes.rows.length === 0) {
    console.error('No tenants found in database');
    process.exit(1);
  }
  const tenantId = tenantRes.rows[0].tenant_id;
  console.log('Using tenant ID:', tenantId);

  // 2. Create a test vendor
  const vendorName = 'Test Deletion Vendor ' + Date.now();
  const vendor = await Vendor.create({
    name: vendorName,
    description: 'Vendor for testing deletion constraint',
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
    supplier: vendorName,
    vendor_id: vendor.id,
    expense_date: new Date()
  });
  console.log('Created test expense linked to vendor:', expense.id);

  // 4. Attempt to delete and check error
  console.log('Attempting to delete vendor (should fail with constraint error)...');
  try {
    await Vendor.delete(vendor.id, { tenantId });
    console.error('FAIL: Vendor was deleted despite constraint!');
  } catch (error) {
    console.log('Caught expected error:', error.message);
    if (error.code === '23503') {
      console.log('SUCCESS: Error code is 23503 (ForeignKeyViolation)');
    } else {
      console.error('FAIL: Unexpected error code:', error.code);
    }
  }

  // 5. Cleanup expense and then delete vendor
  console.log('Cleaning up expense...');
  await Expense.delete(expense.id, { tenantId });
  
  console.log('Attempting to delete vendor again (should succeed)...');
  const deleted = await Vendor.delete(vendor.id, { tenantId });
  if (deleted) {
    console.log('SUCCESS: Vendor deleted successfully after dependency removal');
  } else {
    console.error('FAIL: Vendor still not deleted!');
  }

  process.exit(0);
}

runTest().catch(err => {
  console.error('Error during test:', err);
  process.exit(1);
});
