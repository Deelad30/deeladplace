const db = require('../src/config/database');

async function runMigration() {
  try {
    console.log('Starting migration...');
    
    // Check if columns exist first to avoid errors
    const checkQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='stock_movements' AND column_name='source';
    `;
    
    const checkRes = await db.query(checkQuery);
    
    if (checkRes.rows.length === 0) {
        console.log('Adding specific ledger columns...');
        await db.query(`
            ALTER TABLE stock_movements
            ADD COLUMN source VARCHAR(100),
            ADD COLUMN destination VARCHAR(100),
            ADD COLUMN notes TEXT,
            ADD COLUMN batch_number VARCHAR(50);
        `);
        console.log('Columns added successfully.');
    } else {
        console.log('Columns already exist. Skipping.');
    }

    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

runMigration();
