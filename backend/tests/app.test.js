const request = require('supertest');
const app = require('../src/app');

describe('AgriPulse API', () => {
  test('health check works', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  test('search for a crop that does not exist returns an empty list', async () => {
    const res = await request(app).get('/api/prices?crop=xyz');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('search ignores extra spaces', async () => {
    const res = await request(app).get('/api/prices?crop=%20%20beans%20');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    res.body.forEach((p) => expect(p.crop).toBe('Beans'));
  });

  test('returns all prices', async () => {
    const res = await request(app).get('/api/prices');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(8);
    res.body.forEach((p) => expect(p.date).toMatch(/^\d{4}-\d{2}-\d{2}$/));
  });

  test('filters by market', async () => {
    const res = await request(app).get('/api/prices?market=musanze');
    expect(res.body).toHaveLength(2);
    res.body.forEach((p) => expect(p.market).toBe('Musanze'));
  });

  test('searches by crop name', async () => {
    const res = await request(app).get('/api/prices?crop=beans');
    expect(res.body).toHaveLength(2);
    res.body.forEach((p) => expect(p.crop).toBe('Beans'));
  });

  test('filters by district (case-insensitive)', async () => {
    const res = await request(app).get('/api/prices?district=gasabo');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    res.body.forEach((p) => expect(p.district).toBe('Gasabo'));
  });

  test('returns the list of districts', async () => {
    const res = await request(app).get('/api/districts');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(['Gasabo', 'Musanze', 'Nyarugenge', 'Rubavu', 'Rwamagana']);
  });

  test('returns a single price', async () => {
    const res = await request(app).get('/api/prices/3');
    expect(res.status).toBe(200);
    expect(res.body.crop).toBe('Beans');
    expect(res.body.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  test('returns 404 for unknown price', async () => {
    const res = await request(app).get('/api/prices/999');
    expect(res.status).toBe(404);
  });

  test('returns the list of markets', async () => {
    const res = await request(app).get('/api/markets');
    expect(res.body).toEqual(['Kimironko', 'Musanze', 'Nyabugogo', 'Rubavu', 'Rwamagana']);
  });
});
