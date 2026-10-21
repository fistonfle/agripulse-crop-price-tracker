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

// Older prices for each entry (priceId matches the id above), newest last
const priceHistory = [
  { priceId: 1, date: '2026-10-07', pricePerKg: 380 },
  { priceId: 1, date: '2026-10-14', pricePerKg: 400 },
  { priceId: 2, date: '2026-10-07', pricePerKg: 400 },
  { priceId: 2, date: '2026-10-14', pricePerKg: 380 },
  { priceId: 3, date: '2026-10-07', pricePerKg: 880 },
  { priceId: 3, date: '2026-10-14', pricePerKg: 900 },
  { priceId: 4, date: '2026-10-07', pricePerKg: 470 },
  { priceId: 4, date: '2026-10-14', pricePerKg: 480 },
  { priceId: 5, date: '2026-10-07', pricePerKg: 1250 },
  { priceId: 5, date: '2026-10-14', pricePerKg: 1250 },
  { priceId: 6, date: '2026-10-07', pricePerKg: 820 },
  { priceId: 6, date: '2026-10-14', pricePerKg: 800 },
  { priceId: 7, date: '2026-10-07', pricePerKg: 400 },
  { priceId: 7, date: '2026-10-14', pricePerKg: 420 },
  { priceId: 8, date: '2026-10-07', pricePerKg: 350 },
  { priceId: 8, date: '2026-10-14', pricePerKg: 370 },
];

// Return prices matching the market and/or crop name (case-insensitive)
function filterPrices(market, crop, district) {
  let results = cropPrices;
  if (market) {
    results = results.filter((p) => p.market.toLowerCase() === market.toLowerCase());
  }
  if (crop) {
    results = results.filter((p) => p.crop.toLowerCase().includes(crop.toLowerCase()));
  }
  if (district) {
    results = results.filter((p) => p.district.toLowerCase() === district.toLowerCase());
  }
  return results;
}

function getMarkets() {
  return [...new Set(cropPrices.map((p) => p.market))].sort();
}

function getDistricts() {
  return [...new Set(cropPrices.map((p) => p.district))].sort();
}

function getPriceById(id) {
  return cropPrices.find((p) => p.id === id);
}

// Past prices for one entry, oldest first
function getHistory(priceId) {
  return priceHistory
    .filter((h) => h.priceId === priceId)
    .map(({ date, pricePerKg }) => ({ date, pricePerKg }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

// Add last week's price and the change since then (null when there is no history)
function withChange(price) {
  const history = getHistory(price.id);
  const lastWeek = history[history.length - 1];
  return {
    ...price,
    lastWeekPrice: lastWeek ? lastWeek.pricePerKg : null,
    change: lastWeek ? price.pricePerKg - lastWeek.pricePerKg : null,
  };
}

// Check a new price entry. Returns a list of error messages (empty if valid).
function validatePrice(entry) {
  const errors = [];
  ['crop', 'market', 'district'].forEach((field) => {
    if (typeof entry[field] !== 'string' || entry[field].trim() === '') {
      errors.push(`${field} is required`);
    }
  });
  if (typeof entry.pricePerKg !== 'number' || !(entry.pricePerKg > 0)) {
    errors.push('pricePerKg must be a positive number');
  }
  return errors;
}

function addPrice(entry) {
  const newPrice = {
    id: Math.max(0, ...cropPrices.map((p) => p.id)) + 1,
    crop: entry.crop.trim(),
    market: entry.market.trim(),
    district: entry.district.trim(),
    pricePerKg: entry.pricePerKg,
  };
  cropPrices.push(newPrice);
  return newPrice;
}

module.exports = {
  cropPrices,
  filterPrices,
  getMarkets,
  getDistricts,
  getPriceById,
  getHistory,
  withChange,
  validatePrice,
  addPrice,
};
