def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data
    assert "service" in data
    assert data["ai_provider"] in ["mock", "bedrock"]


def test_dashboard_stats(client):
    response = client.get("/api/dashboard")
    assert response.status_code == 200
    data = response.json()
    assert "total_cases" in data
    assert "cases_awaiting_approval" in data
    assert "resolved_cases" in data
    assert "follow_ups_due" in data
    assert "recent_cases" in data
    assert isinstance(data["recent_cases"], list)
