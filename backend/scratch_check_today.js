const db = require('./src/config/database');

async function checkTodayData() {
  try {
    const lagosNow = new Date().toLocaleString("en-US", {timeZone: "Africa/Lagos"});
    const d = new Date(lagosNow);
    const today = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    
    console.log('Checking for date:', today);

    const expenseSql = `
      SELECT COUNT(*), SUM(amount) 
      FROM expenses 
      WHERE expense_date::date = $1::date
    `;
    const expenseRes = await db.query(expenseSql, [today]);
    console.log('Today Expenses:', expenseRes.rows[0]);

    const profitSql = `
      SELECT COUNT(*), SUM(qty * (selling_price + commission)) as revenue
      FROM pos_sales 
      WHERE (created_at AT TIME ZONE 'Africa/Lagos')::date = $1::date
    `;
    const profitRes = await db.query(profitSql, [today]);
    console.log('Today Sales:', profitRes.rows[0]);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkTodayData();
