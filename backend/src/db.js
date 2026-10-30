require('dotenv').config();
const { Pool, types } = require('pg');

// Return DATE columns as plain 'YYYY-MM-DD' strings instead of JavaScript Dates
types.setTypeParser(types.builtins.DATE, (value) => value);

// Jest sets NODE_ENV=test, so tests use their own database
const connectionString =
  process.env.NODE_ENV === 'test' ? process.env.TEST_DATABASE_URL : process.env.DATABASE_URL;

if (!connectionString) {
  const varName = process.env.NODE_ENV === 'test' ? 'TEST_DATABASE_URL' : 'DATABASE_URL';
  throw new Error(
    `${varName} is not set. Copy backend/.env.example to backend/.env and start the database with: docker compose up -d db`,
  );
}

const pool = new Pool({ connectionString });

module.exports = pool;
