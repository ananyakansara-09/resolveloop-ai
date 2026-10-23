from typing import List, Optional, Tuple
from sqlalchemy.orm import Session, joinedload
from app.models.case import SupportCase


class CaseRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_case(self, case_id: str) -> Optional[SupportCase]:
        return self.db.query(SupportCase).filter(SupportCase.id == case_id).first()

    def get_case_with_relations(self, case_id: str) -> Optional[SupportCase]:
        return (
            self.db.query(SupportCase)
            .options(
                joinedload(SupportCase.order),
                joinedload(SupportCase.messages),
                joinedload(SupportCase.proposed_actions),
                joinedload(SupportCase.follow_ups),
                joinedload(SupportCase.audit_events),
            )
            .filter(SupportCase.id == case_id)
            .first()
        )

    def list_cases(
        self,
        status: Optional[str] = None,
        skip: int = 0,
        limit: int = 20,
    ) -> Tuple[List[SupportCase], int]:
        query = self.db.query(SupportCase)
        if status:
            query = query.filter(SupportCase.status == status)
        total = query.count()
        items = (
            query.order_by(SupportCase.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
        return items, total

    def count_cases_by_status(self, status: str) -> int:
        return self.db.query(SupportCase).filter(SupportCase.status == status).count()

    def count_total_cases(self) -> int:
        return self.db.query(SupportCase).count()

    def get_recent_cases(self, limit: int = 5) -> List[SupportCase]:
        return (
            self.db.query(SupportCase)
            .order_by(SupportCase.created_at.desc())
            .limit(limit)
            .all()
        )

    def create_case(
        self,
        order_id: Optional[str],
        customer_issue: str,
        summary: str,
        priority: str = "medium",
        status: str = "open",
    ) -> SupportCase:
        case = SupportCase(
            order_id=order_id,
            customer_issue=customer_issue,
            summary=summary,
            priority=priority,
            status=status,
        )
        self.db.add(case)
        self.db.commit()
        self.db.refresh(case)
        return case

    def update_case_status(
        self,
        case_id: str,
        status: str,
        resolution: Optional[str] = None,
    ) -> Optional[SupportCase]:
        case = self.get_case(case_id)
        if not case:
            return None
        case.status = status
        if resolution is not None:
            case.resolution = resolution
        self.db.commit()
        self.db.refresh(case)
        return case
