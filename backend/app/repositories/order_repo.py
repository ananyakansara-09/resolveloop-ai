from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.models.order import Order
from app.models.shipping import ShippingEvent


class OrderRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_order(self, order_id: str) -> Optional[Order]:
        return self.db.query(Order).filter(Order.id == order_id).first()

    def get_shipping_events(self, order_id: str) -> List[ShippingEvent]:
        return (
            self.db.query(ShippingEvent)
            .filter(ShippingEvent.order_id == order_id)
            .order_by(ShippingEvent.occurred_at.asc())
            .all()
        )

    def create_order(
        self,
        order_id: str,
        customer_name: str,
        customer_email: str,
        order_date,
        status: str = "processing",
        total_amount: float = 0.0,
        currency: str = "USD",
    ) -> Order:
        order = Order(
            id=order_id,
            customer_name=customer_name,
            customer_email=customer_email,
            order_date=order_date,
            status=status,
            total_amount=total_amount,
            currency=currency,
        )
        self.db.add(order)
        self.db.commit()
        self.db.refresh(order)
        return order

    def add_shipping_event(
        self,
        order_id: str,
        event_type: str,
        description: str,
        location: str,
        occurred_at,
    ) -> ShippingEvent:
        event = ShippingEvent(
            order_id=order_id,
            event_type=event_type,
            description=description,
            location=location,
            occurred_at=occurred_at,
        )
        self.db.add(event)
        self.db.commit()
        self.db.refresh(event)
        return event
