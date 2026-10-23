import uuid
from sqlalchemy import Column, String, DateTime, JSON, ForeignKey, func
from sqlalchemy.orm import relationship
from app.db.session import Base


class AuditEvent(Base):
    __tablename__ = "audit_events"

    id = Column(
        String(64),
        primary_key=True,
        default=lambda: f"AUD-{uuid.uuid4().hex[:8].upper()}",
    )
    case_id = Column(
        String(64),
        ForeignKey("support_cases.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    event_type = Column(String(64), nullable=False, index=True)
    actor = Column(String(64), nullable=False, default="agent")
    details = Column(JSON, nullable=False)
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        index=True,
    )

    case = relationship("SupportCase", back_populates="audit_events")
