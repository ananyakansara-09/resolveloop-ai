from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict


class PolicyRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    policy_type: str
    policy_content: Dict[str, Any]
    active: bool
    version: str
    updated_at: datetime


class PolicyCheckRequest(BaseModel):
    order_id: str
    issue_type: str
    requested_action: str


class PolicyCheckResult(BaseModel):
    eligible: bool
    status: str  # eligible, ineligible, needs_review, requires_approval
    requires_approval: bool
    policy_name: str
    policy_id: str
    allowed_actions: List[str]
    reason: str
    conditions_met: Dict[str, Any] = {}
