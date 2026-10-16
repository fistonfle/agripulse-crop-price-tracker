from flask import Flask, jsonify, render_template, request

app = Flask(__name__)

# Sample data for now (no database yet)
crop_prices = [
    {"id": 1, "crop": "Maize", "market": "Kimironko", "district": "Gasabo", "price_per_kg": 450},
    {"id": 2, "crop": "Irish Potatoes", "market": "Musanze", "district": "Musanze", "price_per_kg": 350},
    {"id": 3, "crop": "Beans", "market": "Nyabugogo", "district": "Nyarugenge", "price_per_kg": 900},
    {"id": 4, "crop": "Cassava Flour", "market": "Rwamagana", "district": "Rwamagana", "price_per_kg": 500},
    {"id": 5, "crop": "Rice", "market": "Kimironko", "district": "Gasabo", "price_per_kg": 1200},
    {"id": 6, "crop": "Beans", "market": "Musanze", "district": "Musanze", "price_per_kg": 850},
    {"id": 7, "crop": "Maize", "market": "Rubavu", "district": "Rubavu", "price_per_kg": 420},
    {"id": 8, "crop": "Irish Potatoes", "market": "Nyabugogo", "district": "Nyarugenge", "price_per_kg": 400},
]


def filter_prices(market=None, crop=None):
    """Return prices matching the market and/or crop name (case-insensitive)."""
    results = crop_prices
    if market:
        results = [p for p in results if p["market"].lower() == market.lower()]
    if crop:
        results = [p for p in results if crop.lower() in p["crop"].lower()]
    return results


def get_markets():
    return sorted({p["market"] for p in crop_prices})


@app.route("/")
def index():
    market = request.args.get("market", "")
    crop = request.args.get("crop", "")
    prices = filter_prices(market, crop)
    return render_template(
        "index.html",
        prices=prices,
        markets=get_markets(),
        selected_market=market,
        search=crop,
    )


@app.route("/api/prices")
def api_prices():
    market = request.args.get("market")
    crop = request.args.get("crop")
    return jsonify(filter_prices(market, crop))


@app.route("/api/prices/<int:price_id>")
def api_price(price_id):
    for p in crop_prices:
        if p["id"] == price_id:
            return jsonify(p)
    return jsonify({"error": "Price not found"}), 404


@app.route("/health")
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    app.run(debug=True, port=5000)
