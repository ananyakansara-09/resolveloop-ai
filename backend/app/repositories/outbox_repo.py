from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.outbox import OutboxMessage


class OutboxRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_outbox_message(
        self,
        case_id: str,
        action_id: str,
        recipient: str,
        subject: str,
        body: str,
        status: str = "sent",
    ) -> OutboxMessage:
        msg = OutboxMessage(
            case_id=case_id,
            action_id=action_id,
            recipient=recipient,
            subject=subject,
            body=body,
            status=status,
        )
        self.db.add(msg)
        self.db.commit()
        self.db.refresh(msg)
        return msg

    def get_outbox_message_by_action(self, action_id: str) -> Optional[OutboxMessage]:
        return (
            self.db.query(OutboxMessage)
            .filter(OutboxMessage.action_id == action_id)
            .first()
        )

    def get_outbox_messages_by_case(self, case_id: str) -> List[OutboxMessage]:
        return (
            self.db.query(OutboxMessage)
            .filter(OutboxMessage.case_id == case_id)
            .order_by(OutboxMessage.sent_at.asc())
            .all()
        )
