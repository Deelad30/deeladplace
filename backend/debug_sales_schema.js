const db = require('./src/config/database');

async function checkSchema() {
  try {
    console.log('Checking pos_sales schema...');
    const schemaRes = await db.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'pos_sales'
      ORDER BY ordinal_position
    `);
    
    console.log('\nColumns in pos_sales table:');
    schemaRes.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type}`);
    });
    
    console.log('\n\nRecent sales data:');
    const dataRes = await db.query(`
      SELECT id, transaction_id, product_id, qty, created_at 
      FROM pos_sales 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    
    console.log(JSON.stringify(dataRes.rows, null, 2));
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

checkSchema();
