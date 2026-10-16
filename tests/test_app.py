from app import app


def client():
    app.config["TESTING"] = True
    return app.test_client()


def test_home_page_loads():
    res = client().get("/")
    assert res.status_code == 200
    assert b"AgriPulse" in res.data


def test_get_all_prices():
    res = client().get("/api/prices")
    assert res.status_code == 200
    assert len(res.get_json()) == 8


def test_filter_by_market():
    res = client().get("/api/prices?market=musanze")
    data = res.get_json()
    assert len(data) == 2
    assert all(p["market"] == "Musanze" for p in data)


def test_search_by_crop():
    res = client().get("/api/prices?crop=beans")
    data = res.get_json()
    assert len(data) == 2
    assert all(p["crop"] == "Beans" for p in data)


def test_price_not_found():
    res = client().get("/api/prices/999")
    assert res.status_code == 404
