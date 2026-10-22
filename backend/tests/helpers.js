const request = require('supertest');
const app = require('../src/app');

// Registers a test user and returns a token for "Authorization: Bearer <token>"
async function loginAsTestUser(email = 'collector@test.rw') {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Test Collector', email, password: 'password123' });
  return res.body.token;
}

module.exports = { loginAsTestUser };
