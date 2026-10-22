const express = require('express');
const pool = require('./db');
const {
  filterPrices,
  getMarkets,
  getDistricts,
  getPriceById,
  getHistory,
  validatePrice,
  addPrice,
} = require('./data');
const { createToken, validateRegister, registerUser, checkLogin, requireAuth } = require('./auth');

const app = express();

app.use(express.json());

// Read :id from the URL. Returns null when it isn't a whole number.
function priceId(req) {
  const id = Number(req.params.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

app.get('/api/prices', async (req, res) => {
  res.json(await filterPrices(req.query.market, req.query.crop, req.query.district));
});

// Only logged-in users can add prices
app.post('/api/prices', requireAuth, async (req, res) => {
  const errors = validatePrice(req.body || {});
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  res.status(201).json(await addPrice(req.body, req.user.id));
});

app.get('/api/prices/:id', async (req, res) => {
  const id = priceId(req);
  const price = id && (await getPriceById(id));
  if (!price) {
    return res.status(404).json({ error: 'Price not found' });
  }
  res.json(price);
});

app.get('/api/prices/:id/history', async (req, res) => {
  const id = priceId(req);
  const price = id && (await getPriceById(id));
  if (!price) {
    return res.status(404).json({ error: 'Price not found' });
  }
  res.json(await getHistory(price.id));
});

app.get('/api/markets', async (req, res) => {
  res.json(await getMarkets());
});

app.get('/api/districts', async (req, res) => {
  res.json(await getDistricts());
});

app.post('/api/auth/register', async (req, res) => {
  const body = req.body || {};
  const errors = validateRegister(body);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  const user = await registerUser(body);
  if (!user) {
    return res.status(409).json({ errors: ['an account with this email already exists'] });
  }
  res.status(201).json({ user, token: createToken(user) });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  const user = await checkLogin(email, password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  res.json({ user, token: createToken(user) });
});

app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

// Also checks the database, so monitoring can tell if the DB is down
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'ok' });
  } catch {
    res.status(503).json({ status: 'error', database: 'unreachable' });
  }
});

// Any unexpected error (e.g. database down) returns a clean 500 instead of crashing
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong' });
});

module.exports = app;
