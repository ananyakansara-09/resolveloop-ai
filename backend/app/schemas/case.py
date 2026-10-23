from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from app.schemas.message import MessageRead
from app.schemas.action import ProposedActionRead
from app.schemas.follow_up import FollowUpRead
from app.schemas.audit import AuditEventRead
from app.schemas.order import OrderRead


class CaseCreate(BaseModel):
    order_id: Optional[str] = None
    customer_issue: str
    summary: Optional[str] = None
    priority: str = "medium"


class CaseRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    order_id: Optional[str] = None
    customer_issue: str
    summary: str
    status: str
    priority: str
    resolution: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class CaseDetailRead(CaseRead):
    order: Optional[OrderRead] = None
    messages: List[MessageRead] = []
    proposed_actions: List[ProposedActionRead] = []
    follow_ups: List[FollowUpRead] = []
    audit_events: List[AuditEventRead] = []


class CaseListResponse(BaseModel):
    items: List[CaseRead]
    total: int
    page: int
    limit: int
