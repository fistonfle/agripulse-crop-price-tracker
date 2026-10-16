# 🌾 AgriPulse: Rwandan Crop Price Tracker

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
2. **Search & filter** — filter prices by crop name or market
3. **Price comparison** *(planned)* — compare today's prices with previous weeks
4. **Contributor portal** *(planned)* — verified traders submit daily market prices

## Technology Stack

| Layer | Technology |
| ----- | ---------- |
| Frontend | React 19, Vite |
| Backend | Node.js, Express 5 (REST API) |
| Testing | Jest + Supertest (backend), Vitest + React Testing Library (frontend) |
| Linting | ESLint |
| Version control | Git & GitHub |

## Project Structure

```
agripulse-crop-price-tracker/
├── backend/                # Express REST API
│   ├── src/
│   │   ├── app.js          # API routes
│   │   ├── data.js         # Sample price data and filter helpers
│   │   └── server.js       # Starts the API on port 3000
│   ├── tests/
│   │   └── app.test.js     # API tests
│   └── package.json
├── frontend/               # React + Vite app
│   ├── src/
│   │   ├── App.jsx         # Main page: search, filter, table
│   │   ├── App.test.jsx    # UI tests
│   │   ├── components/
│   │   │   └── PriceTable.jsx
│   │   └── main.jsx
│   ├── vite.config.js      # Proxies /api to the backend
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Git, so you can clone the repository.
- Node.js 20+ and npm. Install a currently supported **LTS** version from [nodejs.org](https://nodejs.org/en/download): on Windows, choose the Windows installer; on macOS, choose the macOS installer. Include npm when installing, then open a new terminal (PowerShell on Windows or Terminal on macOS).

Check that the tools are available before continuing:

```bash
git --version
node --version
npm --version
```

The backend uses sample data from `backend/src/data.js`; no database, API key, or `.env` file is needed for this local setup.

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

Open another terminal in the cloned `agripulse-crop-price-tracker` directory before running these commands. Keep Terminal 1 running.

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite (normally http://localhost:5173) in your browser. Vite forwards `/api` requests to the backend at http://localhost:3000. Use the Vite URL to view the app, rather than opening `frontend/index.html` directly.

To confirm the API is running, open http://localhost:3000/health and look for `{"status":"ok"}`. The app should show the sample crop prices and a populated Market dropdown.

Press `Ctrl+C` in each terminal when you want to stop its development server.

### Common problems

| Problem | What to check |
| ------- | ------------- |
| `node` or `npm` is not found | Install Node.js LTS with npm, then close and reopen your terminal. Run the version checks above again. |
| `package.json` cannot be found | Run the npm commands inside `backend/` or `frontend/`, not the repository root. Each is a separate npm project and needs its own `npm install`. |
| Backend reports `EADDRINUSE` on port 3000 | Stop the other program using that port, or an older copy of the backend, then restart `npm run dev`. If you deliberately change the backend's `PORT`, also change the `/api` proxy target in `frontend/vite.config.js` and restart Vite. |
| Port 5173 is already in use | Vite normally tries the next free port; open the URL it prints. You can request another port with `npm run dev -- --port 5174` from `frontend/`. |
| "Could not load prices" or "Could not load markets" | Keep the backend running in Terminal 1 and check http://localhost:3000/health. Confirm that Vite's proxy points to the backend's port, then reload the app. |

### Run lint and tests

From the repository root, use a terminal that is not running a development server:

```bash
cd backend
npm run lint
npm test
cd ../frontend
npm run lint
npm test
npm run build
```

The frontend production files are written to `frontend/dist/`. The `/api` proxy above is a Vite development-server setting; a production deployment needs its own API routing.

## API Endpoints

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| GET | `/api/prices` | All prices as JSON. Optional `?market=` and `?crop=` |
| GET | `/api/prices/:id` | A single price entry |
| GET | `/api/markets` | List of markets |
| GET | `/health` | Health check |

## Project Board

Our backlog is tracked on the GitHub Projects board: [AgriPulse Board](https://github.com/users/fistonfle/projects/4/views/1)

## License

This project is licensed under the MIT License — see [LICENSE](./LICENSE).
