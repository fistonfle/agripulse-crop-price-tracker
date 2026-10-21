# 🌾 AgriPulse: Rwandan Crop Price Tracker

[![CI](https://github.com/fistonfle/agripulse-crop-price-tracker/actions/workflows/ci.yml/badge.svg)](https://github.com/fistonfle/agripulse-crop-price-tracker/actions/workflows/ci.yml)

> Empowering farmers, traders, and cooperatives with market price transparency.

## Problem Statement

Smallholder farmers and local traders in Rwanda often lack access to timely, accurate market price data across different trading hubs. This leaves them vulnerable to exploitative middlemen and makes it hard to decide when and where to sell their produce for a fair price.

## Team Members

| Name | Role | Email |
| ---- | ---- | ----- |
| Nshimiyandinze Fiston | Software Engineer | n.fiston@alustudent.com |

## Target Users

- **Smallholder farmers** — find the best local market to sell their harvest
- **Traders & cooperatives** — monitor price trends across regions to plan purchases
- **Consumers / retail buyers** — track food price changes

## Core Features

1. **Price feed** — view current prices for staples (Maize, Beans, Irish Potatoes, Rice) across markets like Kimironko, Musanze, Nyabugogo and Rubavu
2. **Search & filter** — filter prices by crop name, market or district
3. **Price comparison** — see how each price changed since last week (▲ up / ▼ down)
4. **Add new prices** — market collectors submit new prices through a form (login for verified traders planned)

## Technology Stack

| Layer | Technology |
| ----- | ---------- |
| Frontend | React 19, Vite |
| Backend | Node.js, Express 5 (REST API) |
| Testing | Jest + Supertest (backend), Vitest + React Testing Library (frontend) |
| Linting | ESLint |
| CI | GitHub Actions |
| Version control | Git & GitHub |

## Project Structure

```
agripulse-crop-price-tracker/
├── .github/workflows/
│   └── ci.yml              # CI: lint, test, build on PRs
├── backend/                # Express REST API
│   ├── src/
│   │   ├── app.js          # API routes
│   │   ├── data.js         # Sample price data and filter helpers
│   │   └── server.js       # Starts the API on port 3000
│   ├── tests/
│   │   ├── app.test.js     # API tests
│   │   ├── addPrice.test.js # Add price tests
│   │   └── priceChange.test.js # Price comparison tests
│   └── package.json
├── frontend/               # React + Vite app
│   ├── src/
│   │   ├── App.jsx         # Main page: search, filter, table
│   │   ├── App.test.jsx    # UI tests
│   │   ├── components/
│   │   │   ├── PriceTable.jsx
│   │   │   ├── PriceChange.jsx
│   │   │   └── AddPriceForm.jsx
│   │   └── main.jsx
│   ├── vite.config.js      # Proxies /api to the backend
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 20+ and npm

### Run locally

You need **two terminals**: one for the backend, one for the frontend.

```bash
git clone https://github.com/fistonfle/agripulse-crop-price-tracker.git
cd agripulse-crop-price-tracker
```

**Terminal 1: backend (API)**

```bash
cd backend
npm install
npm run dev
```

The API runs at http://localhost:3000.

**Terminal 2: frontend (React)**

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 in your browser. Vite forwards `/api` requests to the backend.

### Run lint and tests

```bash
cd backend && npm run lint && npm test
cd ../frontend && npm run lint && npm test
```

The same checks run automatically on every pull request through GitHub Actions ([ci.yml](.github/workflows/ci.yml)).

## API Endpoints

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| GET | `/api/prices` | All prices as JSON, with `lastWeekPrice` and `change`. Optional `?market=`, `?district=` and `?crop=` |
| POST | `/api/prices` | Add a price. JSON body: `{ crop, market, district, pricePerKg }` |
| GET | `/api/prices/:id` | A single price entry |
| GET | `/api/prices/:id/history` | Past prices for an entry, oldest first |
| GET | `/api/markets` | List of markets |
| GET | `/api/districts` | List of districts |
| GET | `/health` | Health check |

## Project Board

Our backlog is tracked on the GitHub Projects board: [AgriPulse Board](https://github.com/users/fistonfle/projects/4/views/1)

## License

This project is licensed under the MIT License — see [LICENSE](./LICENSE).
