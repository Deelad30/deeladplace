const jwt = require('jsonwebtoken');
const db = require('./src/config/database');
const { authenticateToken } = require('./src/middleware/auth');
const dotenv = require('dotenv');
dotenv.config();

async function verify() {
  try {
    // 1. Get a valid user from the DB to test with
    console.log('Connecting to database...');
    const userRes = await db.query('SELECT id, email FROM users LIMIT 1');
    if (userRes.rows.length === 0) {
      console.log('No users found in database to test with.');
      process.exit(0);
    }
    const user = userRes.rows[0];
    console.log(`Testing with user: ${user.email} (ID: ${user.id})`);

    // 2. Create a token for this user
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
    console.log('Generated token for user.');
    
    // 3. Mock req, res, next
    const req = {
      headers: {
        authorization: `Bearer ${token}`
      }
    };
    const res = {
      status: (code) => {
        console.log(`Response status set to: ${code}`);
        return {
          json: (data) => {
            console.error(`Error response (${code}):`, JSON.stringify(data, null, 2));
          }
        };
      }
    };
    const next = () => {
      console.log('Success: next() called');
      console.log('req.user after middleware:', JSON.stringify(req.user, null, 2));
      if (req.user && req.user.tenant_id) {
        console.log('VERIFICATION PASSED: tenant_id is present');
      } else {
        console.error('VERIFICATION FAILED: tenant_id is missing');
      }
    };

    console.log('Calling authenticateToken middleware...');
    await authenticateToken(req, res, next);
    process.exit(0);
  } catch (err) {
    console.error('Verification script failed with error:');
    console.error(err);
    if (err.stack) console.error(err.stack);
    process.exit(1);
  }
}

verify();
