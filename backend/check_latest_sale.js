const db = require('./src/config/database');

async function checkLatestSale() {
  try {
    console.log('Checking latest sale...\n');
    const res = await db.query(`
      SELECT id, transaction_id, product_id, qty, selling_price, created_at 
      FROM pos_sales 
      ORDER BY created_at DESC 
      LIMIT 1
    `);
    
    if (res.rows.length > 0) {
      const sale = res.rows[0];
      console.log(JSON.stringify(sale, null, 2));
      console.log('\ntransaction_id:', sale.transaction_id || 'NULL/EMPTY');
    } else {
      console.log('No sales found!');
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

checkLatestSale();
