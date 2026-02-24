const db = require('./src/config/database');

async function addWaiterRole() {
  try {
    const checkRole = await db.query("SELECT id FROM roles WHERE name = 'waiter'");
    
    if (checkRole.rows.length === 0) {
      console.log("Adding 'waiter' role to database...");
      await db.query("INSERT INTO roles (name) VALUES ('waiter')");
      console.log("Role 'waiter' added successfully.");
    } else {
      console.log("Role 'waiter' already exists.");
    }
    
    process.exit(0);
  } catch (err) {
    console.error("Failed to add 'waiter' role:", err);
    process.exit(1);
  }
}

addWaiterRole();
