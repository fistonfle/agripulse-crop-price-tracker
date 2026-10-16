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
| Backend | Node.js, Express 5 |
| Frontend | HTML5, CSS (EJS templates) |
| Testing | Jest, Supertest |
| Linting | ESLint |
| Version control | Git & GitHub |

## Project Structure

```
agripulse-crop-price-tracker/
├── src/
│   ├── app.js          # Express app and routes
│   ├── data.js         # Sample price data and filter helpers
│   └── server.js       # Starts the server
├── views/
│   └── index.ejs       # Price table page
├── tests/
│   └── app.test.js     # Unit tests
├── eslint.config.js
├── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 20+ and npm

### Run locally

```bash
git clone https://github.com/fistonfle/agripulse-crop-price-tracker.git
cd agripulse-crop-price-tracker
npm install
npm start
```

Open http://localhost:3000 in your browser.

For development, `npm run dev` restarts the server when you save a file.

### Run lint and tests

```bash
npm run lint
npm test
```

## API Endpoints

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| GET | `/` | Web page with price table, search and market filter |
| GET | `/api/prices` | All prices as JSON. Optional `?market=` and `?crop=` |
| GET | `/api/prices/<id>` | A single price entry |
| GET | `/health` | Health check |

## Project Board

Our backlog is tracked on the GitHub Projects board: [AgriPulse Board](https://github.com/users/fistonfle/projects/4/views/1)

## License

This project is licensed under the MIT License — see [LICENSE](./LICENSE).
