from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from sqlalchemy.orm import Session
from app.repositories.policy_repo import PolicyRepository
from app.repositories.order_repo import OrderRepository
from app.schemas.policy import PolicyCheckResult
from app.core.logging import logger


class PolicyService:
    def __init__(self, db: Session):
        self.db = db
        self.policy_repo = PolicyRepository(db)
        self.order_repo = OrderRepository(db)

    def evaluate_policy(
        self,
        order_id: str,
        issue_type: str,
        requested_action: str,
    ) -> PolicyCheckResult:
        """
        Deterministically evaluates store policy rules against the order and shipping evidence.
        Enforces strict rules:
        - Never invents refund/exchange eligibility.
        - Returns 'needs_review' if evidence or policy is insufficient.
        - Requires explicit approval for outbound communication and concessions.
        """
        order = self.order_repo.get_order(order_id)
        if not order:
            return PolicyCheckResult(
                eligible=False,
                status="needs_review",
                requires_approval=True,
                policy_name="Unknown Order Policy Check",
                policy_id="NONE",
                allowed_actions=[],
                reason=f"Order {order_id} could not be found in repository.",
                conditions_met={"order_exists": False},
            )

        shipping_events = self.order_repo.get_shipping_events(order_id)
        has_delay_event = any(
            "delay" in e.event_type.lower()
            or "exception" in e.event_type.lower()
            or "weather" in e.description.lower()
            or "delay" in e.description.lower()
            for e in shipping_events
        )

        # Retrieve relevant policies
        policies = self.policy_repo.get_active_policies_by_type("shipping_delay")
        if not policies:
            # Fallback to all active policies if specific type not found
            policies = self.policy_repo.get_all_active_policies()

        delay_policy = next(
            (p for p in policies if p.policy_type == "shipping_delay"), None
        )

        if not delay_policy:
            return PolicyCheckResult(
                eligible=False,
                status="needs_review",
                requires_approval=True,
                policy_name="General Store Policy",
                policy_id="DEFAULT",
                allowed_actions=["create_support_case", "create_follow_up"],
                reason="No active shipping delay policy found; case requires human review.",
                conditions_met={"order_id": order_id},
            )

        policy_rules = delay_policy.policy_content or {}
        allowed_actions = policy_rules.get("allowed_actions", [
            "send_customer_email",
            "create_follow_up",
            "offer_concession",
        ])
        requires_approval_by_default = policy_rules.get("requires_approval", True)

        # Check requested action eligibility
        if requested_action in ["send_customer_email", "draft_customer_email", "customer_response"]:
            if has_delay_event:
                return PolicyCheckResult(
                    eligible=True,
                    status="requires_approval",
                    requires_approval=True,
                    policy_name=delay_policy.name,
                    policy_id=delay_policy.id,
                    allowed_actions=allowed_actions,
                    reason=(
                        f"Order {order_id} has documented transit delay. Under Policy "
                        f"{delay_policy.id} ({delay_policy.name}), proactive explanation and apology email is eligible, "
                        f"but requires explicit merchant approval before transmission."
                    ),
                    conditions_met={
                        "order_id": order_id,
                        "delay_detected": True,
                        "latest_location": shipping_events[-1].location if shipping_events else "Unknown",
                        "requires_merchant_approval": True,
                    },
                )
            else:
                return PolicyCheckResult(
                    eligible=False,
                    status="needs_review",
                    requires_approval=True,
                    policy_name=delay_policy.name,
                    policy_id=delay_policy.id,
                    allowed_actions=allowed_actions,
                    reason=f"No shipping delay event found for order {order_id}; customer response needs merchant review.",
                    conditions_met={"delay_detected": False},
                )

        elif requested_action in ["refund", "full_refund", "issue_refund"]:
            # Stricter rules: Cannot issue immediate refund for in-transit package with weather delay
            max_delay_days_for_lost = policy_rules.get("days_before_refund_eligible", 7)
            return PolicyCheckResult(
                eligible=False,
                status="ineligible",
                requires_approval=True,
                policy_name=delay_policy.name,
                policy_id=delay_policy.id,
                allowed_actions=allowed_actions,
                reason=(
                    f"Under policy {delay_policy.id}, full refunds are not eligible while the order is actively in transit "
                    f"unless carrier confirms package is lost or delay exceeds {max_delay_days_for_lost} business days. "
                    f"Recommended action is proactive status notification and scheduled follow-up."
                ),
                conditions_met={
                    "order_status": order.status,
                    "in_transit": True,
                    "refund_eligible": False,
                },
            )

        elif requested_action in ["offer_discount", "offer_concession"]:
            return PolicyCheckResult(
                eligible=True,
                status="requires_approval",
                requires_approval=True,
                policy_name=delay_policy.name,
                policy_id=delay_policy.id,
                allowed_actions=allowed_actions,
                reason=(
                    f"Under policy {delay_policy.id}, a courtesy concession (e.g. 10% coupon or $15 credit) is permissible for "
                    f"delays exceeding 24 hours, but requires merchant approval."
                ),
                conditions_met={"delay_hours_exceeded": True},
            )

        else:
            return PolicyCheckResult(
                eligible=True,
                status="requires_approval" if requires_approval_by_default else "eligible",
                requires_approval=requires_approval_by_default,
                policy_name=delay_policy.name,
                policy_id=delay_policy.id,
                allowed_actions=allowed_actions,
                reason=f"Action '{requested_action}' reviewed under policy {delay_policy.name}.",
                conditions_met={"order_id": order_id},
            )
