import uuid
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.db.session import Base


class OutboxMessage(Base):
    __tablename__ = "outbox_messages"

    id = Column(
        String(64),
        primary_key=True,
        default=lambda: f"MSG-{uuid.uuid4().hex[:8].upper()}",
    )
    case_id = Column(
        String(64),
        ForeignKey("support_cases.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    action_id = Column(
        String(64),
        ForeignKey("proposed_actions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    recipient = Column(String(255), nullable=False)
    subject = Column(String(255), nullable=False)
    body = Column(Text, nullable=False)
    status = Column(String(32), nullable=False, default="sent")
    sent_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    case = relationship("SupportCase", back_populates="outbox_messages")
    action = relationship("ProposedAction", back_populates="outbox_messages")
