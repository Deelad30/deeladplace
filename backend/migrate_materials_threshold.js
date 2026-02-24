const db = require('./src/config/database');
async function migrate() {
  try {
    console.log("Checking if minimum_stock_level column exists...");
    const checkRes = await db.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'raw_materials' AND column_name = 'minimum_stock_level'");
    
    if (checkRes.rows.length === 0) {
      console.log("Adding column minimum_stock_level to raw_materials...");
      await db.query("ALTER TABLE raw_materials ADD COLUMN minimum_stock_level DECIMAL(12,2) DEFAULT 0");
      console.log("Column added successfully.");
    } else {
      console.log("Column already exists.");
    }
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
migrate();
