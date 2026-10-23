import uuid
from sqlalchemy import Column, String, Boolean, JSON, DateTime, func
from app.db.session import Base


class Policy(Base):
    __tablename__ = "policies"

    id = Column(String(64), primary_key=True)
    name = Column(String(255), nullable=False)
    policy_type = Column(String(64), nullable=False, index=True)
    policy_content = Column(JSON, nullable=False)
    active = Column(Boolean, nullable=False, default=True)
    version = Column(String(32), nullable=False, default="1.0")
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
