-- Drops and recreates all tables. Only for development and tests!
DROP TABLE IF EXISTS price_history;
DROP TABLE IF EXISTS prices;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE prices (
  id SERIAL PRIMARY KEY,
  crop TEXT NOT NULL,
  market TEXT NOT NULL,
  district TEXT NOT NULL,
  price_per_kg INTEGER NOT NULL CHECK (price_per_kg > 0),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Older prices for each entry, used for the "change vs last week" column
CREATE TABLE price_history (
  id SERIAL PRIMARY KEY,
  price_id INTEGER NOT NULL REFERENCES prices(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  price_per_kg INTEGER NOT NULL CHECK (price_per_kg > 0)
);
