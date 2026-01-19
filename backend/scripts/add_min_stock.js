const db = require('../src/config/database');

async function runMigration() {
  try {
    console.log('Starting migration for raw_materials...');
    
    const checkQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='raw_materials' AND column_name='min_stock_level';
    `;
    
    const checkRes = await db.query(checkQuery);
    
    if (checkRes.rows.length === 0) {
        console.log('Adding min_stock_level column...');
        await db.query(`
            ALTER TABLE raw_materials
            ADD COLUMN min_stock_level NUMERIC(10,2) DEFAULT 10;
        `);
        console.log('Column added successfully.');
    } else {
        console.log('Column already exists. Skipping.');
    }

    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

runMigration();
