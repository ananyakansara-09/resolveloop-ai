import uuid
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.db.session import Base


class SupportCase(Base):
    __tablename__ = "support_cases"

    id = Column(
        String(64),
        primary_key=True,
        default=lambda: f"CASE-{uuid.uuid4().hex[:8].upper()}",
    )
    order_id = Column(
        String(64),
        ForeignKey("orders.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    customer_issue = Column(Text, nullable=False)
    summary = Column(Text, nullable=False)
    status = Column(
        String(64),
        nullable=False,
        default="open",
        index=True,
    )  # open, investigating, awaiting_approval, in_progress, resolved, closed
    priority = Column(String(32), nullable=False, default="medium")
    resolution = Column(Text, nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # Relationships
    order = relationship("Order", back_populates="cases")
    messages = relationship(
        "Message",
        back_populates="case",
        cascade="all, delete-orphan",
        order_by="Message.created_at.asc()",
    )
    proposed_actions = relationship(
        "ProposedAction",
        back_populates="case",
        cascade="all, delete-orphan",
        order_by="ProposedAction.created_at.asc()",
    )
    follow_ups = relationship(
        "FollowUp",
        back_populates="case",
        cascade="all, delete-orphan",
        order_by="FollowUp.due_at.asc()",
    )
    audit_events = relationship(
        "AuditEvent",
        back_populates="case",
        cascade="all, delete-orphan",
        order_by="AuditEvent.created_at.asc()",
    )
    outbox_messages = relationship(
        "OutboxMessage",
        back_populates="case",
        cascade="all, delete-orphan",
        order_by="OutboxMessage.sent_at.asc()",
    )
