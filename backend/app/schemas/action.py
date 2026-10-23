from datetime import datetime
from typing import Any, Dict, Optional
from pydantic import BaseModel, ConfigDict


class ProposedActionCreate(BaseModel):
    action_type: str
    payload: Dict[str, Any]
    reason: str
    idempotency_key: str


class ProposedActionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    case_id: str
    action_type: str
    payload: Dict[str, Any]
    reason: str
    status: str
    idempotency_key: str
    created_at: datetime
    executed_at: Optional[datetime] = None


class ActionApprovalRequest(BaseModel):
    action_id: Optional[str] = None
    actor: str = "merchant"
    notes: Optional[str] = None


class ActionRejectionRequest(BaseModel):
    action_id: Optional[str] = None
    actor: str = "merchant"
    reason: Optional[str] = None


class ActionExecutionResult(BaseModel):
    action_id: str
    case_id: str
    status: str
    executed: bool
    verified: bool
    verification_details: Dict[str, Any] = {}
    message: str
