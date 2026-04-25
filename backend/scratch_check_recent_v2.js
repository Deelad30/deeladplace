require('dotenv').config({ path: './.env' });
const db = require('./src/config/database');

async function checkRecent() {
  try {
    const res = await db.query(`
      SELECT 
        id, 
        created_at, 
        created_at AT TIME ZONE 'Africa/Lagos' as lagos_time,
        tenant_id,
        qty, 
        selling_price, 
        commission
      FROM pos_sales 
      ORDER BY created_at DESC
      LIMIT 20
    `);
    console.log('Recent Sales (Last 20):');
    console.log(JSON.stringify(res.rows, null, 2));
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkRecent();
