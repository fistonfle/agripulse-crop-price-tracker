// Runs before each test file: start every file with a fresh database
const pool = require('../src/db');
const { resetDatabase } = require('../scripts/setup-db');

beforeAll(async () => {
  await resetDatabase(pool);
});

afterAll(async () => {
  await pool.end();
});
