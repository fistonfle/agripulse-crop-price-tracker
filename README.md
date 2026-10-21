# 🌾 AgriPulse: Rwandan Crop Price Tracker

[![CI](https://github.com/fistonfle/agripulse-crop-price-tracker/actions/workflows/ci.yml/badge.svg)](https://github.com/fistonfle/agripulse-crop-price-tracker/actions/workflows/ci.yml)

> Empowering farmers, traders, and cooperatives with market price transparency.

## Problem Statement

Smallholder farmers and local traders in Rwanda often lack access to timely, accurate market price data across different trading hubs. This leaves them vulnerable to exploitative middlemen and makes it hard to decide when and where to sell their produce for a fair price.

## Team Members

| Name | Role | Email |
| ---- | ---- | ----- |
| Nshimiyandinze Fiston | Software Engineer | n.fiston@alustudent.com |
| Aluel Tabitha Kuir | Software Engineer | t.kuir@alustudent.com |

## Target Users

- **Smallholder farmers** — find the best local market to sell their harvest
- **Traders & cooperatives** — monitor price trends across regions to plan purchases
- **Consumers / retail buyers** — track food price changes

## Core Features

1. **Price feed** — view current prices for staples (Maize, Beans, Irish Potatoes, Rice) across markets like Kimironko, Musanze, Nyabugogo and Rubavu
2. **Search & filter** — filter prices by crop name, market or district
3. **Price comparison** *(planned)* — compare today's prices with previous weeks
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
│   │   └── addPrice.test.js # Add price tests
│   └── package.json
├── frontend/               # React + Vite app
│   ├── src/
│   │   ├── App.jsx         # Main page: search, filter, table
│   │   ├── App.test.jsx    # UI tests
│   │   ├── components/
│   │   │   ├── PriceTable.jsx
│   │   │   └── AddPriceForm.jsx
│   │   └── main.jsx
│   ├── vite.config.js      # Proxies /api to the backend
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites

- **Git**: [git-scm.com/downloads](https://git-scm.com/downloads)
- **Node.js 20 or newer** (npm comes with it): download the **LTS** version from [nodejs.org](https://nodejs.org/)
  - **Windows**: run the `.msi` installer and keep the default options
  - **macOS**: run the `.pkg` installer, or use Homebrew: `brew install node`

After installing, open a **new** terminal and check the versions:

```bash
node -v    # should print v20 or higher
npm -v
git --version
```

On Windows, use **PowerShell** or **Git Bash**. On macOS, use **Terminal**.

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

To check that the backend is running, open http://localhost:3000/health. You should see `{"status":"ok"}`.

To stop either app, press `Ctrl + C` in its terminal.

### Run lint and tests

```bash
cd backend && npm run lint && npm test
cd ../frontend && npm run lint && npm test
```

The same checks run automatically on every pull request through GitHub Actions ([ci.yml](.github/workflows/ci.yml)).

### Common problems

| Problem | Fix |
| ------- | --- |
| `node` or `npm` is not recognized | Node.js isn't installed, or the terminal was open during the install. Install Node.js LTS, then close and reopen the terminal. |
| `npm error enoent ... package.json` | You're in the wrong folder. Run npm commands inside `backend/` or `frontend/`, not the project root. |
| `EADDRINUSE: address already in use :::3000` | Another program is using port 3000 (often an old backend still running). Close it with `Ctrl + C` in that terminal. Or find it: `lsof -i :3000` (macOS) / `netstat -ano \| findstr :3000` (Windows). |
| Vite starts on port 5174 instead of 5173 | Port 5173 is busy. That's fine, just open the URL Vite prints. |
| Page shows "Could not load prices. Is the backend running?" | The backend isn't running. Start it in Terminal 1 (`cd backend && npm run dev`) and refresh the page. |
| `Cannot find module ...` | Dependencies aren't installed. Run `npm install` in that folder. |
| Changes don't show up | The frontend reloads automatically. For the backend, `npm run dev` restarts on save. If you used `npm start`, stop it and run again. |

## API Endpoints

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| GET | `/api/prices` | All prices as JSON. Optional `?market=`, `?district=` and `?crop=` |
| POST | `/api/prices` | Add a price. JSON body: `{ crop, market, district, pricePerKg }` |
| GET | `/api/prices/:id` | A single price entry |
| GET | `/api/markets` | List of markets |
| GET | `/api/districts` | List of districts |
| GET | `/health` | Health check |

## Project Board

Our backlog is tracked on the GitHub Projects board: [AgriPulse Board](https://github.com/users/fistonfle/projects/4/views/1)

## License

This project is licensed under the MIT License — see [LICENSE](./LICENSE).
