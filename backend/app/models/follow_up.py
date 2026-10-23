import uuid
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.db.session import Base


class FollowUp(Base):
    __tablename__ = "follow_ups"

    id = Column(
        String(64),
        primary_key=True,
        default=lambda: f"FOL-{uuid.uuid4().hex[:8].upper()}",
    )
    case_id = Column(
        String(64),
        ForeignKey("support_cases.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    description = Column(Text, nullable=False)
    due_at = Column(DateTime(timezone=True), nullable=False, index=True)
    status = Column(
        String(32),
        nullable=False,
        default="pending",
        index=True,
    )  # pending, in_progress, completed, cancelled
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    completed_at = Column(DateTime(timezone=True), nullable=True)

    case = relationship("SupportCase", back_populates="follow_ups")
