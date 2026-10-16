// Sample data for now (no database yet)
const cropPrices = [
  { id: 1, crop: 'Maize', market: 'Kimironko', district: 'Gasabo', pricePerKg: 450 },
  { id: 2, crop: 'Irish Potatoes', market: 'Musanze', district: 'Musanze', pricePerKg: 350 },
  { id: 3, crop: 'Beans', market: 'Nyabugogo', district: 'Nyarugenge', pricePerKg: 900 },
  { id: 4, crop: 'Cassava Flour', market: 'Rwamagana', district: 'Rwamagana', pricePerKg: 500 },
  { id: 5, crop: 'Rice', market: 'Kimironko', district: 'Gasabo', pricePerKg: 1200 },
  { id: 6, crop: 'Beans', market: 'Musanze', district: 'Musanze', pricePerKg: 850 },
  { id: 7, crop: 'Maize', market: 'Rubavu', district: 'Rubavu', pricePerKg: 420 },
  { id: 8, crop: 'Irish Potatoes', market: 'Nyabugogo', district: 'Nyarugenge', pricePerKg: 400 },
];

// Return prices matching the market and/or crop name (case-insensitive)
function filterPrices(market, crop) {
  let results = cropPrices;
  const normalizedMarket = typeof market === 'string' ? market.trim().toLowerCase() : '';
  const normalizedCrop = typeof crop === 'string' ? crop.trim().toLowerCase() : '';

  if (normalizedMarket) {
    results = results.filter((p) => p.market.toLowerCase() === normalizedMarket);
  }
  if (normalizedCrop) {
    results = results.filter((p) => p.crop.toLowerCase().includes(normalizedCrop));
  }
  return results;
}

function getMarkets() {
  return [...new Set(cropPrices.map((p) => p.market))].sort();
}

function getPriceById(id) {
  return cropPrices.find((p) => p.id === id);
}

module.exports = { cropPrices, filterPrices, getMarkets, getPriceById };
