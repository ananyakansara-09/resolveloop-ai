from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.follow_up import FollowUp


class FollowUpRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_follow_up(self, follow_up_id: str) -> Optional[FollowUp]:
        return self.db.query(FollowUp).filter(FollowUp.id == follow_up_id).first()

    def list_follow_ups(
        self,
        status: Optional[str] = None,
        case_id: Optional[str] = None,
    ) -> List[FollowUp]:
        query = self.db.query(FollowUp)
        if status:
            query = query.filter(FollowUp.status == status)
        if case_id:
            query = query.filter(FollowUp.case_id == case_id)
        return query.order_by(FollowUp.due_at.asc()).all()

    def count_due_follow_ups(self, as_of: Optional[datetime] = None) -> int:
        if as_of is None:
            as_of = datetime.now(timezone.utc)
        return (
            self.db.query(FollowUp)
            .filter(
                FollowUp.status.in_(["pending", "in_progress"]),
                FollowUp.due_at <= as_of,
            )
            .count()
        )

    def create_follow_up(
        self,
        case_id: str,
        description: str,
        due_at: datetime,
    ) -> FollowUp:
        follow_up = FollowUp(
            case_id=case_id,
            description=description,
            due_at=due_at,
            status="pending",
        )
        self.db.add(follow_up)
        self.db.commit()
        self.db.refresh(follow_up)
        return follow_up

    def update_follow_up(
        self,
        follow_up_id: str,
        description: Optional[str] = None,
        due_at: Optional[datetime] = None,
        status: Optional[str] = None,
    ) -> Optional[FollowUp]:
        item = self.get_follow_up(follow_up_id)
        if not item:
            return None
        if description is not None:
            item.description = description
        if due_at is not None:
            item.due_at = due_at
        if status is not None:
            item.status = status
            if status == "completed" and item.completed_at is None:
                item.completed_at = datetime.now(timezone.utc)
            elif status != "completed":
                item.completed_at = None
        self.db.commit()
        self.db.refresh(item)
        return item
