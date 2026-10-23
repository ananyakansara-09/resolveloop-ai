from datetime import datetime, timezone, timedelta


def test_follow_up_lifecycle(client):
    # 1. Create a case
    case_resp = client.post(
        "/api/cases",
        json={
            "order_id": "KL-1042",
            "customer_issue": "Customer inquiring about shipment status",
            "summary": "Delay inquiry",
        },
    )
    assert case_resp.status_code == 201
    case_id = case_resp.json()["id"]

    # 2. Create follow-up via API
    due_time = (datetime.now(timezone.utc) + timedelta(days=2)).isoformat()
    follow_resp = client.post(
        f"/api/cases/{case_id}/follow-ups",
        json={
            "description": "Call carrier dispatcher to verify Siskiyou Pass status",
            "due_at": due_time,
        },
    )
    assert follow_resp.status_code == 201
    follow_data = follow_resp.json()
    follow_id = follow_data["id"]
    assert follow_data["case_id"] == case_id
    assert follow_data["status"] == "pending"

    # 3. List follow-ups
    list_resp = client.get(f"/api/follow-ups?case_id={case_id}")
    assert list_resp.status_code == 200
    items = list_resp.json()
    assert len(items) >= 1
    assert any(f["id"] == follow_id for f in items)

    # 4. Update follow-up status to completed
    patch_resp = client.patch(
        f"/api/follow-ups/{follow_id}",
        json={"status": "completed", "description": "Resolved with carrier dispatch."},
    )
    assert patch_resp.status_code == 200
    updated = patch_resp.json()
    assert updated["status"] == "completed"
    assert updated["completed_at"] is not None
    assert updated["description"] == "Resolved with carrier dispatch."
