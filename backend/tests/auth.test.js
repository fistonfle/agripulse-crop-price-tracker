const request = require('supertest');
const app = require('../src/app');

const newUser = { name: 'Aline Uwase', email: 'Aline@Example.rw', password: 'password123' };

describe('Register and login', () => {
  test('registers a new user and returns a token', async () => {
    const res = await request(app).post('/api/auth/register').send(newUser);
    expect(res.status).toBe(201);
    expect(res.body.user).toEqual({ id: 1, name: 'Aline Uwase', email: 'aline@example.rw' });
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.user).not.toHaveProperty('password_hash');
  });

  test('does not allow the same email twice', async () => {
    const res = await request(app).post('/api/auth/register').send(newUser);
    expect(res.status).toBe(409);
  });

  test('rejects a short password and a bad email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Bob', email: 'not-an-email', password: '123' });
    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual([
      'a valid email is required',
      'password must be at least 8 characters',
    ]);
  });

  test('logs in with the right password (email is not case-sensitive)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'aline@example.rw', password: 'password123' });
    expect(res.status).toBe(200);
    expect(res.body.user.name).toBe('Aline Uwase');
    expect(res.body.token).toEqual(expect.any(String));
  });

  test('rejects a wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'aline@example.rw', password: 'wrong-password' });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid email or password');
  });

  test('/api/auth/me returns the logged-in user', async () => {
    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'aline@example.rw', password: 'password123' });
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${login.body.token}`);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('aline@example.rw');
  });
});

describe('Protected routes', () => {
  const price = { crop: 'Sorghum', market: 'Huye', district: 'Huye', pricePerKg: 600 };

  test('adding a price without logging in returns 401', async () => {
    const res = await request(app).post('/api/prices').send(price);
    expect(res.status).toBe(401);
  });

  test('a fake token returns 401', async () => {
    const res = await request(app)
      .post('/api/prices')
      .set('Authorization', 'Bearer not-a-real-token')
      .send(price);
    expect(res.status).toBe(401);
  });

  test('a logged-in user can add a price and is shown as the author', async () => {
    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'aline@example.rw', password: 'password123' });
    const res = await request(app)
      .post('/api/prices')
      .set('Authorization', `Bearer ${login.body.token}`)
      .send(price);
    expect(res.status).toBe(201);
    expect(res.body.addedBy).toBe('Aline Uwase');
  });
});
