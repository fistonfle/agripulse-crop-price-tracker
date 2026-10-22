const request = require('supertest');
const app = require('../src/app');

describe('Compare prices with last week', () => {
  test('each price includes last week price and change', async () => {
    const res = await request(app).get('/api/prices');
    res.body.forEach((p) => {
      expect(p).toHaveProperty('lastWeekPrice');
      expect(p).toHaveProperty('change');
    });
  });

  test('price went up', async () => {
    const res = await request(app).get('/api/prices/1');
    expect(res.body.lastWeekPrice).toBe(400);
    expect(res.body.change).toBe(50);
  });

  test('price went down', async () => {
    const res = await request(app).get('/api/prices/2');
    expect(res.body.lastWeekPrice).toBe(380);
    expect(res.body.change).toBe(-30);
  });

  test('price did not change', async () => {
    const res = await request(app).get('/api/prices/3');
    expect(res.body.change).toBe(0);
  });

  test('returns price history oldest first', async () => {
    const res = await request(app).get('/api/prices/1/history');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      { date: '2026-10-07', pricePerKg: 380 },
      { date: '2026-10-14', pricePerKg: 400 },
    ]);
  });

  test('history for unknown price returns 404', async () => {
    const res = await request(app).get('/api/prices/999/history');
    expect(res.status).toBe(404);
  });

  test('a new price has no history yet', async () => {
    const res = await request(app)
      .post('/api/prices')
      .send({ crop: 'Sorghum', market: 'Huye', district: 'Huye', pricePerKg: 600 });
    expect(res.body.lastWeekPrice).toBeNull();
    expect(res.body.change).toBeNull();

    const history = await request(app).get(`/api/prices/${res.body.id}/history`);
    expect(history.body).toEqual([]);
  });
});
