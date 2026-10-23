from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.policy import Policy


class PolicyRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_policy(self, policy_id: str) -> Optional[Policy]:
        return self.db.query(Policy).filter(Policy.id == policy_id).first()

    def get_active_policies_by_type(self, policy_type: str) -> List[Policy]:
        return (
            self.db.query(Policy)
            .filter(Policy.policy_type == policy_type, Policy.active.is_(True))
            .all()
        )

    def get_all_active_policies(self) -> List[Policy]:
        return self.db.query(Policy).filter(Policy.active.is_(True)).all()

    def create_or_update_policy(
        self,
        policy_id: str,
        name: str,
        policy_type: str,
        policy_content: dict,
        version: str = "1.0",
        active: bool = True,
    ) -> Policy:
        existing = self.get_policy(policy_id)
        if existing:
            existing.name = name
            existing.policy_type = policy_type
            existing.policy_content = policy_content
            existing.version = version
            existing.active = active
            self.db.commit()
            self.db.refresh(existing)
            return existing
        else:
            policy = Policy(
                id=policy_id,
                name=name,
                policy_type=policy_type,
                policy_content=policy_content,
                version=version,
                active=active,
            )
            self.db.add(policy)
            self.db.commit()
            self.db.refresh(policy)
            return policy
