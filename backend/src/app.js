const express = require('express');
const { filterPrices, getMarkets, getDistricts, getPriceById, validatePrice, addPrice } = require('./data');

const app = express();

app.use(express.json());

app.get('/api/prices', (req, res) => {
  res.json(filterPrices(req.query.market, req.query.crop, req.query.district));
});

app.post('/api/prices', (req, res) => {
  const errors = validatePrice(req.body || {});
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  res.status(201).json(addPrice(req.body));
});

app.get('/api/prices/:id', (req, res) => {
  const price = getPriceById(Number(req.params.id));
  if (!price) {
    return res.status(404).json({ error: 'Price not found' });
  }
  res.json(price);
});

app.get('/api/markets', (req, res) => {
  res.json(getMarkets());
});

app.get('/api/districts', (req, res) => {
  res.json(getDistricts());
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

module.exports = app;
