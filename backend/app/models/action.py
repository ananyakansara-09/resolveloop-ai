import uuid
from sqlalchemy import Column, String, Text, DateTime, JSON, ForeignKey, func, UniqueConstraint
from sqlalchemy.orm import relationship
from app.db.session import Base


class ProposedAction(Base):
    __tablename__ = "proposed_actions"

    id = Column(
        String(64),
        primary_key=True,
        default=lambda: f"ACT-{uuid.uuid4().hex[:8].upper()}",
    )
    case_id = Column(
        String(64),
        ForeignKey("support_cases.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    action_type = Column(String(64), nullable=False)  # send_customer_email, refund, etc.
    payload = Column(JSON, nullable=False)
    reason = Column(Text, nullable=False)
    status = Column(
        String(32),
        nullable=False,
        default="pending",
        index=True,
    )  # pending, approved, rejected, executed, failed
    idempotency_key = Column(String(128), unique=True, nullable=False, index=True)
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    executed_at = Column(DateTime(timezone=True), nullable=True)

    case = relationship("SupportCase", back_populates="proposed_actions")
    outbox_messages = relationship("OutboxMessage", back_populates="action")
