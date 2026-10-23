import uuid
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.session import Base


class ShippingEvent(Base):
    __tablename__ = "shipping_events"

    id = Column(
        String(64),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )
    order_id = Column(
        String(64),
        ForeignKey("orders.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    event_type = Column(String(64), nullable=False)
    description = Column(Text, nullable=False)
    location = Column(String(255), nullable=False)
    occurred_at = Column(DateTime(timezone=True), nullable=False)

    order = relationship("Order", back_populates="shipping_events")
