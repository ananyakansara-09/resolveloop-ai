from typing import Any, Dict, List
from sqlalchemy.orm import Session
from app.tools.registry import tool_registry
from app.repositories.order_repo import OrderRepository


@tool_registry.register(
    name="get_shipping_status",
    description="Retrieve carrier shipping timeline, tracking status, delay exceptions and transit events for an order.",
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
def get_shipping_status(db: Session, order_id: str) -> Dict[str, Any]:
    order_repo = OrderRepository(db)
    events = order_repo.get_shipping_events(order_id)
    if not events:
        return {
            "order_id": order_id,
            "has_events": False,
            "events_count": 0,
            "latest_event": None,
            "is_delayed": False,
            "message": f"No shipping tracking events found for order {order_id}.",
        }

    latest = events[-1]
    is_delayed = any(
        "delay" in e.event_type.lower()
        or "delay" in e.description.lower()
        or "exception" in e.event_type.lower()
        for e in events
    )

    events_data = [
        {
            "id": e.id,
            "event_type": e.event_type,
            "description": e.description,
            "location": e.location,
            "occurred_at": e.occurred_at.isoformat(),
        }
        for e in events
    ]

    return {
        "order_id": order_id,
        "has_events": True,
        "events_count": len(events),
        "is_delayed": is_delayed,
        "latest_event": {
            "event_type": latest.event_type,
            "description": latest.description,
            "location": latest.location,
            "occurred_at": latest.occurred_at.isoformat(),
        },
        "timeline": events_data,
    }
