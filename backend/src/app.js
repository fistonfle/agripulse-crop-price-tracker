const express = require('express');
const { filterPrices, getMarkets, getPriceById } = require('./data');

const app = express();

app.get('/api/prices', (req, res) => {
  res.json(filterPrices(req.query.market, req.query.crop));
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

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

module.exports = app;
