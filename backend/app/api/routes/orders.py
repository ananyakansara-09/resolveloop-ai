from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.repositories.order_repo import OrderRepository
from app.schemas.order import OrderRead, ShippingEventsResponse, ShippingEventRead

router = APIRouter(prefix="/api/orders", tags=["Orders"])


@router.get("/{order_id}", response_model=OrderRead)
def get_order(order_id: str, db: Session = Depends(get_db)):
    """
    Retrieve order details and associated shipping timeline.
    """
    repo = OrderRepository(db)
    order = repo.get_order(order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order '{order_id}' not found.",
        )
    return OrderRead.model_validate(order)


@router.get("/{order_id}/shipping", response_model=ShippingEventsResponse)
def get_order_shipping(order_id: str, db: Session = Depends(get_db)):
    """
    Retrieve carrier tracking and shipping event history for an order.
    """
    repo = OrderRepository(db)
    order = repo.get_order(order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order '{order_id}' not found.",
        )
    events = repo.get_shipping_events(order_id)
    return ShippingEventsResponse(
        order_id=order_id,
        events=[ShippingEventRead.model_validate(e) for e in events],
    )
