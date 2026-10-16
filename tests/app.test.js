const request = require('supertest');
const app = require('../src/app');

describe('AgriPulse', () => {
  test('home page loads', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toContain('AgriPulse');
  });

  test('returns all prices', async () => {
    const res = await request(app).get('/api/prices');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(8);
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

  test('returns 404 for unknown price', async () => {
    const res = await request(app).get('/api/prices/999');
    expect(res.status).toBe(404);
  });
});
