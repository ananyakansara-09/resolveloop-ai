import datetime
import uuid
from sqlalchemy import Column, String, Float, DateTime, func
from sqlalchemy.orm import relationship
from app.db.session import Base


class Order(Base):
    __tablename__ = "orders"

    id = Column(String(64), primary_key=True, index=True)
    customer_name = Column(String(255), nullable=False)
    customer_email = Column(String(255), nullable=False, index=True)
    order_date = Column(DateTime(timezone=True), nullable=False)
    status = Column(String(64), nullable=False, default="processing")
    total_amount = Column(Float, nullable=False, default=0.0)
    currency = Column(String(8), nullable=False, default="USD")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # Relationships
    shipping_events = relationship(
        "ShippingEvent",
        back_populates="order",
        cascade="all, delete-orphan",
        order_by="ShippingEvent.occurred_at.asc()",
    )
    cases = relationship("SupportCase", back_populates="order")
