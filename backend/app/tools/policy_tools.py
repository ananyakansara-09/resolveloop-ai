from typing import Any, Dict
from sqlalchemy.orm import Session
from app.tools.registry import tool_registry
from app.services.policy_service import PolicyService


@tool_registry.register(
    name="check_store_policy",
    description="Deterministically evaluate store policy guidelines and constraints for an order, issue type, and requested action.",
    parameters_schema={
        "type": "object",
        "properties": {
            "order_id": {
                "type": "string",
                "description": "The unique order identifier.",
            },
            "issue_type": {
                "type": "string",
                "description": "Category of issue (e.g., 'shipping_delay', 'return_request', 'cancellation').",
            },
            "requested_action": {
                "type": "string",
                "description": "Proposed action to evaluate (e.g., 'send_customer_email', 'refund', 'offer_concession').",
            },
        },
        "required": ["order_id", "issue_type", "requested_action"],
    },
)
def check_store_policy(
    db: Session,
    order_id: str,
    issue_type: str,
    requested_action: str,
) -> Dict[str, Any]:
    service = PolicyService(db)
    result = service.evaluate_policy(
        order_id=order_id,
        issue_type=issue_type,
        requested_action=requested_action,
    )
    return result.model_dump()
