from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict


class DashboardRecentCase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    order_id: Optional[str] = None
    summary: str
    status: str
    priority: str
    created_at: datetime


class DashboardStatsResponse(BaseModel):
    total_cases: int
    cases_awaiting_approval: int
    resolved_cases: int
    follow_ups_due: int
    recent_cases: List[DashboardRecentCase]
