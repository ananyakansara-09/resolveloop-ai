from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict


class ShippingEventRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    order_id: str
    event_type: str
    description: str
    location: str
    occurred_at: datetime


class OrderRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    customer_name: str
    customer_email: str
    order_date: datetime
    status: str
    total_amount: float
    currency: str
    created_at: datetime
    updated_at: datetime
    shipping_events: List[ShippingEventRead] = []


class ShippingEventsResponse(BaseModel):
    order_id: str
    events: List[ShippingEventRead]
