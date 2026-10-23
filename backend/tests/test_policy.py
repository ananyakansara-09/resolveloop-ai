from app.services.policy_service import PolicyService


def test_delay_email_policy_requires_approval(db):
    service = PolicyService(db)
    result = service.evaluate_policy(
        order_id="KL-1042",
        issue_type="shipping_delay",
        requested_action="send_customer_email",
    )
    assert result.eligible is True
    assert result.requires_approval is True
    assert result.status == "requires_approval"
    assert "KL-1042" in result.reason


def test_refund_ineligible_while_in_transit(db):
    service = PolicyService(db)
    result = service.evaluate_policy(
        order_id="KL-1042",
        issue_type="shipping_delay",
        requested_action="issue_refund",
    )
    assert result.eligible is False
    assert result.status == "ineligible"
    assert "in transit" in result.reason.lower()


def test_concession_policy(db):
    service = PolicyService(db)
    result = service.evaluate_policy(
        order_id="KL-1042",
        issue_type="shipping_delay",
        requested_action="offer_concession",
    )
    assert result.eligible is True
    assert result.requires_approval is True


def test_unknown_order_needs_review(db):
    service = PolicyService(db)
    result = service.evaluate_policy(
        order_id="NONEXISTENT-999",
        issue_type="shipping_delay",
        requested_action="send_customer_email",
    )
    assert result.eligible is False
    assert result.status == "needs_review"
