const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('./db');

const TOKEN_LIFETIME = '7d';

function jwtSecret() {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not set. Copy backend/.env.example to backend/.env');
  }
  return process.env.JWT_SECRET;
}

// Only send safe fields to the browser (never the password hash)
function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email };
}

function createToken(user) {
  return jwt.sign({ sub: user.id, name: user.name, email: user.email }, jwtSecret(), {
    expiresIn: TOKEN_LIFETIME,
  });
}

function validateRegister({ name, email, password }) {
  const errors = [];
  if (typeof name !== 'string' || name.trim() === '') {
    errors.push('name is required');
  }
  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.push('a valid email is required');
  }
  if (typeof password !== 'string' || password.length < 8) {
    errors.push('password must be at least 8 characters');
  }
  return errors;
}

// Returns the new user, or null if the email is already used
async function registerUser({ name, email, password }) {
  const passwordHash = await bcrypt.hash(password, 10);
  try {
    const { rows } = await pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name.trim(), email.trim().toLowerCase(), passwordHash],
    );
    return rows[0];
  } catch (err) {
    if (err.code === '23505') return null; // unique_violation: email already exists
    throw err;
  }
}

// Returns the user when the email and password match, otherwise null
async function checkLogin(email, password) {
  if (typeof email !== 'string' || typeof password !== 'string') return null;
  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [
    email.trim().toLowerCase(),
  ]);
  const user = rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) return null;
  return publicUser(user);
}

// Express middleware: only lets the request through with a valid token
// Expects the header "Authorization: Bearer <token>"
function requireAuth(req, res, next) {
  const [type, token] = (req.headers.authorization || '').split(' ');
  if (type !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Please log in first' });
  }
  try {
    const payload = jwt.verify(token, jwtSecret());
    req.user = { id: payload.sub, name: payload.name, email: payload.email };
    next();
  } catch {
    res.status(401).json({ error: 'Your session has expired, please log in again' });
  }
}

module.exports = { createToken, validateRegister, registerUser, checkLogin, requireAuth };
