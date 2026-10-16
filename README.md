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
| Backend | Python, Flask |
| Frontend | HTML5, CSS (Jinja templates) |
| Testing | pytest |
| Version control | Git & GitHub |

## Project Structure

```
agripulse-crop-price-tracker/
├── app.py              # Flask app and routes
├── templates/
│   └── index.html      # Price table page
├── tests/
│   └── test_app.py     # Unit tests
├── requirements.txt
└── README.md
```

## Getting Started

### Prerequisites

- Python 3.10+

### Run locally

```bash
git clone https://github.com/<your-username>/agripulse-crop-price-tracker.git
cd agripulse-crop-price-tracker
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Open http://127.0.0.1:5000 in your browser.

### Run tests

```bash
pytest
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
