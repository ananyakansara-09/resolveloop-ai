from typing import List
from sqlalchemy.orm import Session
from app.models.message import Message


class MessageRepository:
    def __init__(self, db: Session):
        self.db = db

    def add_message(self, case_id: str, role: str, content: str) -> Message:
        message = Message(case_id=case_id, role=role, content=content)
        self.db.add(message)
        self.db.commit()
        self.db.refresh(message)
        return message

    def get_messages_by_case(self, case_id: str) -> List[Message]:
        return (
            self.db.query(Message)
            .filter(Message.case_id == case_id)
            .order_by(Message.created_at.asc())
            .all()
        )
