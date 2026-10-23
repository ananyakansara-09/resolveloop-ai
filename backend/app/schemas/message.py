from datetime import datetime
from pydantic import BaseModel, ConfigDict


class MessageCreate(BaseModel):
    role: str
    content: str


class MessageRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    case_id: str
    role: str
    content: str
    created_at: datetime
