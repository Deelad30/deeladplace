require('dotenv').config({ path: './.env' });
const db = require('./src/config/database');

async function checkRecent() {
  try {
    const res = await db.query(`
      SELECT 
        id, 
        created_at, 
        created_at AT TIME ZONE 'Africa/Lagos' as lagos_time,
        qty, 
        selling_price, 
        commission
      FROM pos_sales 
      WHERE created_at > NOW() - INTERVAL '24 hours'
      ORDER BY created_at DESC
    `);
    console.log('Recent Sales (Last 24 Hours):');
    console.log(JSON.stringify(res.rows, null, 2));
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkRecent();
