def test_agent_orchestrates_kl1042_investigation(client):
    payload = {
        "message": (
            "Investigate order KL-1042, find out why it is delayed, check our policy, "
            "prepare a customer response, and follow up tomorrow if it remains unresolved."
        ),
        "caseId": None,
    }

    response = client.post("/api/agent/run", json=payload)
    assert response.status_code == 200
    data = response.json()

    # 1. Verify Case ID
    assert data["caseId"] is not None
    assert data["caseId"].startswith("CASE-")

    # 2. Verify Assistant Message
    assert "KL-1042" in data["assistantMessage"]
    assert "Sarah Connor" in data["assistantMessage"]
    assert "delayed" in data["assistantMessage"].lower() or "delay" in data["assistantMessage"].lower()

    # 3. Verify Order Information
    assert data["order"] is not None
    assert data["order"]["id"] == "KL-1042"
    assert data["order"]["customer_name"] == "Sarah Connor"

    # 4. Verify Tool Execution Results
    tool_names = [t["tool_name"] for t in data["toolExecutionResults"]]
    assert "lookup_order" in tool_names
    assert "get_shipping_status" in tool_names
    assert "check_store_policy" in tool_names
    assert "create_support_case" in tool_names
    assert "draft_customer_email" in tool_names
    assert "create_follow_up" in tool_names

    # 5. Verify Policy Decision
    assert data["policyDecision"] is not None
    assert data["policyDecision"]["status"] == "requires_approval"

    # 6. Verify Proposed Consequential Action
    assert len(data["proposedActions"]) >= 1
    action = data["proposedActions"][0]
    assert action["action_type"] == "send_customer_email"
    assert action["status"] == "pending"
    assert action["idempotency_key"] is not None

    # 7. Verify Approval Requirements
    assert data["approvalRequirements"]["has_pending_approval"] is True

    # 8. Verify Follow-Up Details
    assert data["followUpDetails"] is not None
    assert data["followUpDetails"]["status"] == "pending"
    assert "KL-1042" in data["followUpDetails"]["description"] or "shipment" in data["followUpDetails"]["description"]

    # 9. Verify Current Case Status
    assert data["currentCaseStatus"] in ["awaiting_approval", "investigating"]

    # 10. Verify Audit Events
    assert len(data["auditEvents"]) >= 1
    event_types = [e["event_type"] for e in data["auditEvents"]]
    assert any("case_created" in t for t in event_types)
    assert any("action_proposed" in t for t in event_types)
