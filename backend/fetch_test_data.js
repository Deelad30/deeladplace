const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const db = require('./src/config/database');

async function checkData() {
  try {
    const products = await db.query('SELECT id, name, tenant_id FROM products LIMIT 10');
    console.log('PRODUCTS:', products.rows);

    const materials = await db.query('SELECT id, name, tenant_id FROM raw_materials LIMIT 10');
    console.log('MATERIALS:', materials.rows);

    process.exit(0);
  } catch (err) {
    console.error('TEST_ERROR:', err.message);
    process.exit(1);
  }
}

checkData();
