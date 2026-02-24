const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config();

async function verifyDeletionErrorHandling() {
  const JWT_SECRET = process.env.JWT_SECRET;
  const API_URL = 'http://localhost:5000/api/purchases'; // Adjust port if needed

  console.log('--- Verifying Deletion Error Handling ---');

  // 1. Create a dummy token
  const token = jwt.sign({ userId: 1, tenant_id: 1, role_id: 1 }, JWT_SECRET);
  console.log('Generated mock token.');

  try {
    // 2. Try to delete a non-existent purchase
    console.log('Attempting to delete non-existent purchase (ID: 999999)...');
    const response = await axios.delete(`${API_URL}/999999`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Unexpected success:', response.data);
  } catch (err) {
    const data = err.response?.data;
    const status = err.response?.status;
    
    console.log(`Received expected error. Status: ${status}`);
    console.log('Response data:', JSON.stringify(data, null, 2));

    if (status === 400 || status === 500) {
      if (data.message && data.message !== '') {
        console.log('VERIFICATION PASSED: Error message is present and correctly returned.');
      } else {
        console.error('VERIFICATION FAILED: Error message is missing or empty.');
      }
    } else {
      console.error(`VERIFICATION FAILED: Unexpected status code ${status}`);
    }
  }
}

verifyDeletionErrorHandling();
