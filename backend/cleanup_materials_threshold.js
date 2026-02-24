const db = require('./src/config/database');
async function cleanup() {
  try {
    console.log("Migrating data from minimum_stock_level to min_stock_level...");
    await db.query("UPDATE raw_materials SET min_stock_level = minimum_stock_level WHERE minimum_stock_level > 0");
    
    console.log("Dropping minimum_stock_level column...");
    await db.query("ALTER TABLE raw_materials DROP COLUMN minimum_stock_level");
    
    console.log("Cleanup successful.");
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
cleanup();
