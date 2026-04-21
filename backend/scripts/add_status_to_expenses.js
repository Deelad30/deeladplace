const db = require('../src/config/database');

async function migrate() {
  try {
    console.log('Adding status column to expenses table...');
    
    // Check if column exists first
    const checkCol = await db.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'expenses' AND column_name = 'status'
    `);

    if (checkCol.rows.length === 0) {
      await db.query(`
        ALTER TABLE expenses 
        ADD COLUMN status VARCHAR(20) DEFAULT 'unsettled'
      `);
      console.log('Status column added successfully.');
      
      // Update existing rows to 'settled' if any (assuming historical data was settled)
      // Actually, the user might want historical data to be unsettled too, 
      // but usually historical data is settled. 
      // Let's set existing ones to settled to avoid messing up current reports.
      await db.query(`UPDATE expenses SET status = 'settled' WHERE status IS NULL OR status = 'unsettled'`);
      console.log('Existing expenses marked as settled.');
    } else {
      console.log('Status column already exists.');
    }

    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
