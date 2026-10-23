from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class FollowUpCreate(BaseModel):
    description: str
    due_at: datetime


class FollowUpUpdate(BaseModel):
    description: Optional[str] = None
    due_at: Optional[datetime] = None
    status: Optional[str] = None


class FollowUpRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    case_id: str
    description: str
    due_at: datetime
    status: str
    created_at: datetime
    completed_at: Optional[datetime] = None
