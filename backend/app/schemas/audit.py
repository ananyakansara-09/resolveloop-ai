from datetime import datetime
from typing import Any, Dict
from pydantic import BaseModel, ConfigDict


class AuditEventRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    case_id: str
    event_type: str
    actor: str
    details: Dict[str, Any]
    created_at: datetime
