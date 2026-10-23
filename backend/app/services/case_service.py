from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from app.repositories.case_repo import CaseRepository
from app.repositories.message_repo import MessageRepository
from app.repositories.audit_repo import AuditRepository
from app.models.case import SupportCase
from app.models.message import Message
from app.models.audit import AuditEvent


class CaseService:
    def __init__(self, db: Session):
        self.db = db
        self.case_repo = CaseRepository(db)
        self.message_repo = MessageRepository(db)
        self.audit_repo = AuditRepository(db)

    def get_case(self, case_id: str) -> Optional[SupportCase]:
        return self.case_repo.get_case_with_relations(case_id)

    def list_cases(
        self,
        status: Optional[str] = None,
        page: int = 1,
        limit: int = 20,
    ) -> Tuple[List[SupportCase], int]:
        skip = max(0, (page - 1) * limit)
        return self.case_repo.list_cases(status=status, skip=skip, limit=limit)

    def create_case(
        self,
        order_id: Optional[str],
        customer_issue: str,
        summary: Optional[str] = None,
        priority: str = "medium",
        status: str = "open",
    ) -> SupportCase:
        if not summary:
            summary = customer_issue[:100]
        case = self.case_repo.create_case(
            order_id=order_id,
            customer_issue=customer_issue,
            summary=summary,
            priority=priority,
            status=status,
        )
        self.audit_repo.log_audit_event(
            case_id=case.id,
            event_type="case_created",
            actor="agent",
            details={
                "order_id": order_id,
                "summary": summary,
                "priority": priority,
                "initial_status": status,
            },
        )
        return case

    def add_message(self, case_id: str, role: str, content: str) -> Message:
        return self.message_repo.add_message(case_id=case_id, role=role, content=content)

    def log_audit(
        self,
        case_id: str,
        event_type: str,
        actor: str,
        details: dict,
    ) -> AuditEvent:
        return self.audit_repo.log_audit_event(
            case_id=case_id,
            event_type=event_type,
            actor=actor,
            details=details,
        )
