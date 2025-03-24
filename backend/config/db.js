const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

// Create a connection pool
const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT || 5432,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test the connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error connecting to PostgreSQL database:', err.stack);
  } else {
    console.log('Connected to PostgreSQL database');
    release();
  }
});

// Export the query method for use in other modules
module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
