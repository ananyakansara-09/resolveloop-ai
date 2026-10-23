from datetime import datetime
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.repositories.follow_up_repo import FollowUpRepository
from app.repositories.case_repo import CaseRepository
from app.repositories.audit_repo import AuditRepository
from app.models.follow_up import FollowUp


class FollowUpService:
    def __init__(self, db: Session):
        self.db = db
        self.follow_up_repo = FollowUpRepository(db)
        self.case_repo = CaseRepository(db)
        self.audit_repo = AuditRepository(db)

    def get_follow_up(self, follow_up_id: str) -> Optional[FollowUp]:
        return self.follow_up_repo.get_follow_up(follow_up_id)

    def list_follow_ups(
        self,
        status: Optional[str] = None,
        case_id: Optional[str] = None,
    ) -> List[FollowUp]:
        return self.follow_up_repo.list_follow_ups(status=status, case_id=case_id)

    def create_follow_up(
        self,
        case_id: str,
        description: str,
        due_at: datetime,
    ) -> FollowUp:
        case = self.case_repo.get_case(case_id)
        if not case:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Case {case_id} not found.",
            )

        follow_up = self.follow_up_repo.create_follow_up(
            case_id=case_id,
            description=description,
            due_at=due_at,
        )
        self.audit_repo.log_audit_event(
            case_id=case_id,
            event_type="follow_up_created",
            actor="agent",
            details={
                "follow_up_id": follow_up.id,
                "description": description,
                "due_at": due_at.isoformat(),
            },
        )
        return follow_up

    def update_follow_up(
        self,
        follow_up_id: str,
        description: Optional[str] = None,
        due_at: Optional[datetime] = None,
        status_val: Optional[str] = None,
    ) -> FollowUp:
        item = self.follow_up_repo.get_follow_up(follow_up_id)
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Follow-up {follow_up_id} not found.",
            )

        updated = self.follow_up_repo.update_follow_up(
            follow_up_id=follow_up_id,
            description=description,
            due_at=due_at,
            status=status_val,
        )
        self.audit_repo.log_audit_event(
            case_id=item.case_id,
            event_type="follow_up_updated",
            actor="merchant",
            details={
                "follow_up_id": follow_up_id,
                "description": description,
                "due_at": due_at.isoformat() if due_at else None,
                "status": status_val,
            },
        )
        return updated
