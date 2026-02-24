const db = require('./src/config/database');

async function migrate() {
  try {
    console.log("Creating active_bills table...");
    await db.query(`
      CREATE TABLE IF NOT EXISTS active_bills (
        id SERIAL PRIMARY KEY,
        tenant_id INTEGER NOT NULL,
        bill_no VARCHAR(50) NOT NULL,
        status VARCHAR(20) DEFAULT 'active', -- 'active', 'settled', 'void'
        total_amount NUMERIC(15, 2) DEFAULT 0,
        created_by INTEGER NOT NULL,
        settled_by INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        settled_at TIMESTAMP,
        transaction_id VARCHAR(255) -- Reference to physical POS transaction after settlement
      )
    `);
    console.log("active_bills table created or already exists.");

    console.log("Creating active_bill_items table...");
    await db.query(`
      CREATE TABLE IF NOT EXISTS active_bill_items (
        id SERIAL PRIMARY KEY,
        bill_id INTEGER REFERENCES active_bills(id) ON DELETE CASCADE,
        product_id INTEGER NOT NULL,
        qty NUMERIC(10, 2) NOT NULL,
        selling_price NUMERIC(15, 2) NOT NULL,
        commission NUMERIC(15, 2) DEFAULT 0,
        added_by INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("active_bill_items table created or already exists.");

    console.log("Migrations completed successfully.");
    process.exit(0);
  } catch (e) {
    console.error("Migration failed:", e);
    process.exit(1);
  }
}

migrate();
