"""
Comprehensive End-to-End Hackathon Demo Verification Test
Matches Section 2 & Section 13 criteria:
Submit request for KL-1042 → retrieve order → check shipping → check policy →
draft response → save pending approval → approve → execute permitted action once →
create follow-up → verify state → reload the saved case.
"""

def test_full_hackathon_demo_lifecycle(client):
    prompt_message = (
        "Investigate order KL-1042, find out why it is delayed, check our policy, "
        "prepare a customer response, and follow up tomorrow if it remains unresolved."
    )

    # 1. Step 1-8, 12-14: Shop owner submits resolution request
    run_response = client.post(
        "/api/agent/run",
        json={"message": prompt_message, "caseId": None},
    )
    assert run_response.status_code == 200
    res_data = run_response.json()

    case_id = res_data["caseId"]
    assert case_id is not None
    assert case_id.startswith("CASE-")

    # Verify order lookup & shipping evidence
    assert res_data["order"]["id"] == "KL-1042"
    assert res_data["order"]["status"] == "delayed"
    assert res_data["evidence"]["shipping"]["is_delayed"] is True
    assert "Siskiyou Pass" in res_data["evidence"]["shipping"]["latest_event"]["location"]

    # Verify policy decision
    assert res_data["policyDecision"]["status"] == "requires_approval"
    assert res_data["policyDecision"]["eligible"] is True

    # Verify recommendation
    assert "KL-1042" in res_data["recommendation"]
    assert "delay" in res_data["recommendation"].lower()

    # Verify drafted action requires explicit approval
    assert len(res_data["proposedActions"]) == 1
    action = res_data["proposedActions"][0]
    action_id = action["id"]
    assert action["status"] == "pending"
    assert action["action_type"] == "send_customer_email"
    assert res_data["approvalRequirements"]["has_pending_approval"] is True

    # Verify follow-up task scheduled for tomorrow
    assert res_data["followUpDetails"] is not None
    assert res_data["followUpDetails"]["status"] == "pending"
    assert "due_at" in res_data["followUpDetails"]

    # Verify case status
    assert res_data["currentCaseStatus"] in ["awaiting_approval", "investigating"]

    # 2. Step 9-11: Explicit merchant approval and execution
    approve_response = client.post(
        f"/api/cases/{case_id}/approve",
        json={
            "action_id": action_id,
            "actor": "store_owner",
            "notes": "Verified delay with carrier; customer notification approved.",
        },
    )
    assert approve_response.status_code == 200
    approval_result = approve_response.json()

    assert approval_result["executed"] is True
    assert approval_result["verified"] is True
    assert approval_result["status"] == "executed"
    outbox_id = approval_result["verification_details"]["outbox_message_id"]
    assert outbox_id is not None

    # 3. Step 10 check: verify duplicate execution is prevented
    dup_approve_response = client.post(
        f"/api/cases/{case_id}/approve",
        json={"action_id": action_id, "actor": "store_owner"},
    )
    assert dup_approve_response.status_code == 200
    dup_result = dup_approve_response.json()
    assert dup_result["executed"] is True
    # Verify same outbox message ID was preserved without generating duplicate emails
    assert dup_result["verification_details"]["outbox_message_id"] == outbox_id

    # 4. Step 13 & Reload: Reload saved case from database
    reload_response = client.get(f"/api/cases/{case_id}")
    assert reload_response.status_code == 200
    saved_case = reload_response.json()

    assert saved_case["id"] == case_id
    assert saved_case["order_id"] == "KL-1042"
    assert saved_case["status"] == "in_progress"
    assert len(saved_case["messages"]) >= 2  # user and assistant messages
    assert len(saved_case["proposed_actions"]) == 1
    assert saved_case["proposed_actions"][0]["status"] == "executed"
    assert len(saved_case["follow_ups"]) >= 1
    assert len(saved_case["audit_events"]) >= 4  # case_created, action_proposed, approved, executed_and_verified

    # 5. Check dashboard reflection
    dash_response = client.get("/api/dashboard")
    assert dash_response.status_code == 200
    dash_data = dash_response.json()
    assert dash_data["total_cases"] >= 1
    assert any(c["id"] == case_id for c in dash_data["recent_cases"])
