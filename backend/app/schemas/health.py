from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: str = "healthy"
    service: str = "ResolveLoop AI"
    version: str
    environment: str
    ai_provider: str
