from typing import Any, Dict
from sqlalchemy.orm import Session
from app.tools.registry import tool_registry
from app.repositories.order_repo import OrderRepository


@tool_registry.register(
    name="lookup_order",
    description="Retrieve order details including customer details, date, items, amount and current status.",
    parameters_schema={
        "type": "object",
        "properties": {
            "order_id": {
                "type": "string",
                "description": "The unique order identifier (e.g., 'KL-1042').",
            }
        },
        "required": ["order_id"],
    },
)
def lookup_order(db: Session, order_id: str) -> Dict[str, Any]:
    order_repo = OrderRepository(db)
    order = order_repo.get_order(order_id)
    if not order:
        return {
            "found": False,
            "order_id": order_id,
            "message": f"Order {order_id} not found in the database.",
        }

    return {
        "found": True,
        "order_id": order.id,
        "customer_name": order.customer_name,
        "customer_email": order.customer_email,
        "order_date": order.order_date.isoformat(),
        "status": order.status,
        "total_amount": order.total_amount,
        "currency": order.currency,
        "created_at": order.created_at.isoformat() if order.created_at else None,
    }
