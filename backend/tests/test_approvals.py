def test_approval_and_duplicate_protection(client):
    # Step 1: Run agent to create case and pending email action
    run_resp = client.post(
        "/api/agent/run",
        json={
            "message": "Investigate order KL-1042, check policy and prepare a customer response.",
            "caseId": None,
        },
    )
    assert run_resp.status_code == 200
    case_id = run_resp.json()["caseId"]
    actions = run_resp.json()["proposedActions"]
    assert len(actions) >= 1
    action_id = actions[0]["id"]

    # Step 2: Approve the pending action
    approve_resp = client.post(
        f"/api/cases/{case_id}/approve",
        json={"action_id": action_id, "actor": "merchant_admin", "notes": "Approved for dispatch"},
    )
    assert approve_resp.status_code == 200
    result = approve_resp.json()
    assert result["executed"] is True
    assert result["verified"] is True
    assert result["status"] == "executed"
    assert "outbox_message_id" in result["verification_details"]

    # Step 3: Check case status was updated to in_progress (NOT prematurely resolved)
    case_resp = client.get(f"/api/cases/{case_id}")
    assert case_resp.status_code == 200
    assert case_resp.json()["status"] == "in_progress"

    # Step 4: Duplicate approval protection (Idempotency)
    dup_resp = client.post(
        f"/api/cases/{case_id}/approve",
        json={"action_id": action_id, "actor": "merchant_admin"},
    )
    assert dup_resp.status_code == 200
    dup_result = dup_resp.json()
    assert dup_result["executed"] is True
    assert dup_result["verified"] is True
    assert "already" in dup_result["message"].lower() or dup_result["status"] == "executed"


def test_rejection_flow(client):
    # Create case with pending action
    run_resp = client.post(
        "/api/agent/run",
        json={
            "message": "Investigate order KL-1042 and draft an email.",
            "caseId": None,
        },
    )
    assert run_resp.status_code == 200
    case_id = run_resp.json()["caseId"]
    action_id = run_resp.json()["proposedActions"][0]["id"]

    # Reject action
    reject_resp = client.post(
        f"/api/cases/{case_id}/reject",
        json={"action_id": action_id, "reason": "Wait for carrier confirmation first."},
    )
    assert reject_resp.status_code == 200
    assert reject_resp.json()["status"] == "rejected"

    # Attempting to approve rejected action should be blocked
    approve_resp = client.post(
        f"/api/cases/{case_id}/approve",
        json={"action_id": action_id},
    )
    assert approve_resp.status_code == 400
    assert "rejected" in approve_resp.json()["message"].lower()
