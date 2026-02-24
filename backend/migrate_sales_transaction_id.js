const db = require('./src/config/database');

async function migrate() {
  try {
    console.log("Checking if transaction_id column exists in sales table...");
    const checkRes = await db.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'sales' AND column_name = 'transaction_id'
    `);
    
    if (checkRes.rows.length === 0) {
      console.log("Adding column transaction_id to sales...");
      await db.query("ALTER TABLE sales ADD COLUMN transaction_id VARCHAR(255)");
      console.log("Column added successfully.");
      
      console.log("Creating index on transaction_id...");
      await db.query("CREATE INDEX idx_sales_transaction_id ON sales(transaction_id)");
      console.log("Index created successfully.");
    } else {
      console.log("Column transaction_id already exists.");
    }
    
    process.exit(0);
  } catch (e) {
    console.error("Migration failed:", e);
    process.exit(1);
  }
}

migrate();
