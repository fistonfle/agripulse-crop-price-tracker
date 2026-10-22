// Creates the tables and loads sample data.
// Usage: npm run db:setup   (WARNING: deletes existing data)
const fs = require('fs');
const path = require('path');

async function resetDatabase(pool) {
  const dbDir = path.join(__dirname, '..', 'db');
  await pool.query(fs.readFileSync(path.join(dbDir, 'schema.sql'), 'utf8'));
  await pool.query(fs.readFileSync(path.join(dbDir, 'seed.sql'), 'utf8'));
}

if (require.main === module) {
  const pool = require('../src/db');
  resetDatabase(pool)
    .then(() => console.log('Database ready: tables created and sample data loaded'))
    .catch((err) => {
      console.error('Database setup failed:', err.message);
      process.exitCode = 1;
    })
    .finally(() => pool.end());
}

module.exports = { resetDatabase };
