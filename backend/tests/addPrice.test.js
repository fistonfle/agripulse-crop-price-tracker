const request = require('supertest');
const app = require('../src/app');
const { loginAsTestUser } = require('./helpers');

describe('POST /api/prices', () => {
  let token;

  beforeAll(async () => {
    token = await loginAsTestUser();
  });

  test('adds a new price', async () => {
    const newPrice = { crop: 'Sorghum', market: 'Huye', district: 'Huye', pricePerKg: 600 };

    const res = await request(app).post('/api/prices').set('Authorization', `Bearer ${token}`).send(newPrice);
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject(newPrice);
    expect(res.body.id).toBe(9);
    expect(res.body.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);

    // The new price shows up in the list with a date
    const list = await request(app).get('/api/prices?crop=sorghum');
    expect(list.body).toHaveLength(1);
    expect(list.body[0].date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  test('new market appears in the market list', async () => {
    const res = await request(app).get('/api/markets');
    expect(res.body).toContain('Huye');
  });

  test('rejects missing fields', async () => {
    const res = await request(app).post('/api/prices').set('Authorization', `Bearer ${token}`).send({ crop: 'Maize' });
    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual([
      'market is required',
      'district is required',
      'pricePerKg must be a positive number',
    ]);
  });

  test('rejects a negative price', async () => {
    const res = await request(app)
      .post('/api/prices')
      .set('Authorization', `Bearer ${token}`)
      .send({ crop: 'Maize', market: 'Kimironko', district: 'Gasabo', pricePerKg: -10 });
    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual(['pricePerKg must be a positive number']);
  });

  test('rejects a price sent as text', async () => {
    const res = await request(app)
      .post('/api/prices')
      .set('Authorization', `Bearer ${token}`)
      .send({ crop: 'Maize', market: 'Kimironko', district: 'Gasabo', pricePerKg: '500' });
    expect(res.status).toBe(400);
  });

  test('rejects blank names', async () => {
    const res = await request(app)
      .post('/api/prices')
      .set('Authorization', `Bearer ${token}`)
      .send({ crop: '   ', market: 'Kimironko', district: 'Gasabo', pricePerKg: 500 });
    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual(['crop is required']);
  });
});
