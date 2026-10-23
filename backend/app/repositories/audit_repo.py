from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.audit import AuditEvent


class AuditRepository:
    def __init__(self, db: Session):
        self.db = db

    def log_audit_event(
        self,
        case_id: str,
        event_type: str,
        actor: str,
        details: dict,
    ) -> AuditEvent:
        event = AuditEvent(
            case_id=case_id,
            event_type=event_type,
            actor=actor,
            details=details,
        )
        self.db.add(event)
        self.db.commit()
        self.db.refresh(event)
        return event

    def get_audit_events_by_case(self, case_id: str) -> List[AuditEvent]:
        return (
            self.db.query(AuditEvent)
            .filter(AuditEvent.case_id == case_id)
            .order_by(AuditEvent.created_at.asc())
            .all()
        )
