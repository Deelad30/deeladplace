const pool = require('./src/config/database');

async function migrate() {
  try {
    console.log('Creating product_labour table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS product_labour (
        id SERIAL PRIMARY KEY,
        tenant_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        labour_id INTEGER NOT NULL,
        amount DECIMAL(15,2) NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Creating product_opex table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS product_opex (
        id SERIAL PRIMARY KEY,
        tenant_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        opex_id INTEGER NOT NULL,
        amount DECIMAL(15,2) NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Migration completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
