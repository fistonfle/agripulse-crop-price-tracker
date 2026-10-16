const path = require('path');
const express = require('express');
const { filterPrices, getMarkets, getPriceById } = require('./data');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

app.get('/', (req, res) => {
  const market = req.query.market || '';
  const crop = req.query.crop || '';
  res.render('index', {
    prices: filterPrices(market, crop),
    markets: getMarkets(),
    selectedMarket: market,
    search: crop,
  });
});

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

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

module.exports = app;
