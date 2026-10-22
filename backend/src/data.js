// Sample data for now (no database yet)
// Dates are illustrative development data; actual market verification dates are not recorded.
const cropPrices = [
  { id: 1, crop: 'Maize', market: 'Kimironko', district: 'Gasabo', pricePerKg: 450, date: '2026-01-15' },
  { id: 2, crop: 'Irish Potatoes', market: 'Musanze', district: 'Musanze', pricePerKg: 350, date: '2026-01-15' },
  { id: 3, crop: 'Beans', market: 'Nyabugogo', district: 'Nyarugenge', pricePerKg: 900, date: '2026-01-16' },
  { id: 4, crop: 'Cassava Flour', market: 'Rwamagana', district: 'Rwamagana', pricePerKg: 500, date: '2026-01-16' },
  { id: 5, crop: 'Rice', market: 'Kimironko', district: 'Gasabo', pricePerKg: 1200, date: '2026-01-17' },
  { id: 6, crop: 'Beans', market: 'Musanze', district: 'Musanze', pricePerKg: 850, date: '2026-01-17' },
  { id: 7, crop: 'Maize', market: 'Rubavu', district: 'Rubavu', pricePerKg: 420, date: '2026-01-18' },
  { id: 8, crop: 'Irish Potatoes', market: 'Nyabugogo', district: 'Nyarugenge', pricePerKg: 400, date: '2026-01-18' },
];

// Return prices matching the market and/or crop name (case-insensitive)
function filterPrices(market, crop) {
  let results = cropPrices;
  if (market) {
    results = results.filter((p) => p.market.toLowerCase() === market.toLowerCase());
  }
  if (crop) {
    results = results.filter((p) => p.crop.toLowerCase().includes(crop.toLowerCase()));
  }
  return results;
}

function getMarkets() {
  return [...new Set(cropPrices.map((p) => p.market))].sort();
}

function getPriceById(id) {
  return cropPrices.find((p) => p.id === id);
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

function todayDate() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function addPrice(entry) {
  const newPrice = {
    id: Math.max(0, ...cropPrices.map((p) => p.id)) + 1,
    crop: entry.crop.trim(),
    market: entry.market.trim(),
    district: entry.district.trim(),
    pricePerKg: entry.pricePerKg,
    date: todayDate(),
  };
  cropPrices.push(newPrice);
  return newPrice;
}

module.exports = { cropPrices, filterPrices, getMarkets, getPriceById, validatePrice, addPrice };
