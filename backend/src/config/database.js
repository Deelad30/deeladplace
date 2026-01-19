const { Pool } = require('pg');
require('dotenv').config();
const logger = require('../utils/logger');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // full Neon URL from .env
  ssl: {
    rejectUnauthorized: false, // allows Neon’s SSL connection
  },
});

// Test database connection
pool.on('connect', () => {
  logger.info('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  logger.error('Database connection error', { error: err.message });
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
