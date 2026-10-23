def test_get_order_kl1042(client):
    response = client.get("/api/orders/KL-1042")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "KL-1042"
    assert data["customer_name"] == "Sarah Connor"
    assert data["status"] == "delayed"
    assert data["total_amount"] == 149.99
    assert len(data["shipping_events"]) >= 3


def test_get_order_shipping_timeline(client):
    response = client.get("/api/orders/KL-1042/shipping")
    assert response.status_code == 200
    data = response.json()
    assert data["order_id"] == "KL-1042"
    assert len(data["events"]) >= 3
    events = data["events"]
    # Check carrier delay event
    delay_events = [e for e in events if e["event_type"] == "carrier_delay"]
    assert len(delay_events) >= 1
    assert "Siskiyou Pass" in delay_events[0]["location"]


def test_get_order_not_found(client):
    response = client.get("/api/orders/UNKNOWN-9999")
    assert response.status_code == 404
    assert response.json()["error"] is True
