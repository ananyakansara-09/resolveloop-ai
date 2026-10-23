from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.action import ProposedAction


class ActionRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_action(self, action_id: str) -> Optional[ProposedAction]:
        return (
            self.db.query(ProposedAction)
            .filter(ProposedAction.id == action_id)
            .first()
        )

    def get_action_by_idempotency_key(
        self, idempotency_key: str
    ) -> Optional[ProposedAction]:
        return (
            self.db.query(ProposedAction)
            .filter(ProposedAction.idempotency_key == idempotency_key)
            .first()
        )

    def get_pending_actions_by_case(self, case_id: str) -> List[ProposedAction]:
        return (
            self.db.query(ProposedAction)
            .filter(
                ProposedAction.case_id == case_id,
                ProposedAction.status == "pending",
            )
            .all()
        )

    def create_action(
        self,
        case_id: str,
        action_type: str,
        payload: dict,
        reason: str,
        idempotency_key: str,
        status: str = "pending",
    ) -> ProposedAction:
        existing = self.get_action_by_idempotency_key(idempotency_key)
        if existing:
            return existing

        action = ProposedAction(
            case_id=case_id,
            action_type=action_type,
            payload=payload,
            reason=reason,
            idempotency_key=idempotency_key,
            status=status,
        )
        self.db.add(action)
        self.db.commit()
        self.db.refresh(action)
        return action

    def update_action_status(
        self,
        action_id: str,
        status: str,
        executed_at: Optional[datetime] = None,
    ) -> Optional[ProposedAction]:
        action = self.get_action(action_id)
        if not action:
            return None
        action.status = status
        if executed_at is not None:
            action.executed_at = executed_at
        elif status == "executed" and action.executed_at is None:
            action.executed_at = datetime.now(timezone.utc)
        self.db.commit()
        self.db.refresh(action)
        return action
