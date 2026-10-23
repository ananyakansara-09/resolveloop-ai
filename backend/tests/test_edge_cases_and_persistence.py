def test_missing_order_handling(client):
    response = client.post(
        "/api/agent/run",
        json={
            "message": "Investigate order KL-9999 and check why it is delayed.",
            "caseId": None,
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["order"] is None
    assert "not found" in data["assistantMessage"].lower() or "attempted" in data["assistantMessage"].lower()
    # Ensure no fabricated success or approval
    assert data["proposedActions"] == []


def test_case_persistence_and_reload(client):
    # Step 1: Run agent to create case
    run_resp = client.post(
        "/api/agent/run",
        json={
            "message": "Investigate order KL-1042, prepare response, and follow up tomorrow.",
            "caseId": None,
        },
    )
    assert run_resp.status_code == 200
    case_id = run_resp.json()["caseId"]

    # Step 2: Reload the saved case through standard case endpoint
    case_resp = client.get(f"/api/cases/{case_id}")
    assert case_resp.status_code == 200
    case_data = case_resp.json()
    assert case_data["id"] == case_id
    assert case_data["order_id"] == "KL-1042"
    assert len(case_data["messages"]) >= 2
    assert len(case_data["proposed_actions"]) >= 1
    assert len(case_data["follow_ups"]) >= 1
    assert len(case_data["audit_events"]) >= 1


def test_cases_pagination_and_filter(client):
    # Query with pagination and status
    list_resp = client.get("/api/cases?page=1&limit=10")
    assert list_resp.status_code == 200
    data = list_resp.json()
    assert "items" in data
    assert "total" in data
    assert "page" in data
    assert "limit" in data
    assert data["page"] == 1
    assert data["limit"] == 10
