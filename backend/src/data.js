const pool = require('./db');

// Columns returned for every price, including last week's price and the change.
// LATERAL picks the newest history row for each price.
const PRICE_SELECT = `
  SELECT p.id, p.crop, p.market, p.district,
         p.price_per_kg AS "pricePerKg",
         p.date,
         h.price_per_kg AS "lastWeekPrice",
         p.price_per_kg - h.price_per_kg AS change
  FROM prices p
  LEFT JOIN LATERAL (
    SELECT price_per_kg FROM price_history
    WHERE price_id = p.id
    ORDER BY date DESC
    LIMIT 1
  ) h ON true
`;

// Return prices matching the market, crop name and/or district (case-insensitive)
async function filterPrices(market, crop, district) {
  const conditions = [];
  const values = [];

  if (market) {
    values.push(market.trim());
    conditions.push(`LOWER(p.market) = LOWER($${values.length})`);
  }
  const cropText = typeof crop === 'string' ? crop.trim() : '';
  if (cropText) {
    values.push(`%${cropText}%`);
    conditions.push(`p.crop ILIKE $${values.length}`);
  }
  if (district) {
    values.push(district.trim());
    conditions.push(`LOWER(p.district) = LOWER($${values.length})`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const { rows } = await pool.query(`${PRICE_SELECT} ${where} ORDER BY p.id`, values);
  return rows;
}

async function getMarkets() {
  const { rows } = await pool.query('SELECT DISTINCT market FROM prices ORDER BY market');
  return rows.map((r) => r.market);
}

async function getDistricts() {
  const { rows } = await pool.query('SELECT DISTINCT district FROM prices ORDER BY district');
  return rows.map((r) => r.district);
}

async function getPriceById(id) {
  const { rows } = await pool.query(`${PRICE_SELECT} WHERE p.id = $1`, [id]);
  return rows[0];
}

// Past prices for one entry, oldest first
async function getHistory(priceId) {
  const { rows } = await pool.query(
    'SELECT date, price_per_kg AS "pricePerKg" FROM price_history WHERE price_id = $1 ORDER BY date',
    [priceId],
  );
  return rows;
}

// Check a new price entry. Returns a list of error messages (empty if valid).
function validatePrice(entry) {
  const errors = [];
  ['crop', 'market', 'district'].forEach((field) => {
    if (typeof entry[field] !== 'string' || entry[field].trim() === '') {
      errors.push(`${field} is required`);
    }
  });
  if (!Number.isInteger(entry.pricePerKg) || entry.pricePerKg <= 0) {
    errors.push('pricePerKg must be a positive number');
  }
  return errors;
}

async function addPrice(entry) {
  const { rows } = await pool.query(
    `INSERT INTO prices (crop, market, district, price_per_kg)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [entry.crop.trim(), entry.market.trim(), entry.district.trim(), entry.pricePerKg],
  );
  return getPriceById(rows[0].id);
}

module.exports = {
  filterPrices,
  getMarkets,
  getDistricts,
  getPriceById,
  getHistory,
  validatePrice,
  addPrice,
};
