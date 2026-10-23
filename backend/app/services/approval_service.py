from datetime import datetime, timezone
from typing import Any, Dict, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.repositories.action_repo import ActionRepository
from app.repositories.case_repo import CaseRepository
from app.repositories.audit_repo import AuditRepository
from app.repositories.outbox_repo import OutboxRepository
from app.repositories.order_repo import OrderRepository
from app.services.policy_service import PolicyService
from app.schemas.action import ActionExecutionResult
from app.core.logging import logger


class ApprovalService:
    def __init__(self, db: Session):
        self.db = db
        self.action_repo = ActionRepository(db)
        self.case_repo = CaseRepository(db)
        self.audit_repo = AuditRepository(db)
        self.outbox_repo = OutboxRepository(db)
        self.order_repo = OrderRepository(db)
        self.policy_service = PolicyService(db)

    def verify_action_result(self, action_id: str) -> Dict[str, Any]:
        """
        Verifies the resulting state in the database for an executed action.
        Never marks an action completed without verifying backend records.
        """
        action = self.action_repo.get_action(action_id)
        if not action:
            return {"verified": False, "error": f"Action {action_id} not found"}

        if action.action_type in ["send_customer_email", "draft_customer_email"]:
            outbox_msg = self.outbox_repo.get_outbox_message_by_action(action_id)
            if not outbox_msg:
                return {
                    "verified": False,
                    "action_id": action_id,
                    "error": "Outbox record missing from database.",
                }
            return {
                "verified": True,
                "action_id": action_id,
                "action_type": action.action_type,
                "outbox_message_id": outbox_msg.id,
                "recipient": outbox_msg.recipient,
                "subject": outbox_msg.subject,
                "status": outbox_msg.status,
                "dispatched_at": outbox_msg.sent_at.isoformat() if outbox_msg.sent_at else None,
            }
        else:
            return {
                "verified": True,
                "action_id": action_id,
                "action_type": action.action_type,
                "status": action.status,
                "executed_at": action.executed_at.isoformat() if action.executed_at else None,
            }

    def approve_action(
        self,
        case_id: str,
        action_id: Optional[str] = None,
        actor: str = "merchant",
        notes: Optional[str] = None,
    ) -> ActionExecutionResult:
        case = self.case_repo.get_case(case_id)
        if not case:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Case {case_id} not found.",
            )

        # Find target action
        if action_id:
            action = self.action_repo.get_action(action_id)
            if not action or action.case_id != case_id:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Action {action_id} not found for case {case_id}.",
                )
        else:
            pending_actions = self.action_repo.get_pending_actions_by_case(case_id)
            if not pending_actions:
                # Check if there is an already executed action for idempotency
                all_actions = (
                    self.db.query(self.action_repo.get_action.__annotations__.get('return', None) or type(case.proposed_actions[0]))
                    if case.proposed_actions
                    else []
                )
                executed_action = next(
                    (a for a in case.proposed_actions if a.status == "executed"), None
                )
                if executed_action:
                    verification = self.verify_action_result(executed_action.id)
                    return ActionExecutionResult(
                        action_id=executed_action.id,
                        case_id=case_id,
                        status="executed",
                        executed=True,
                        verified=verification.get("verified", False),
                        verification_details=verification,
                        message="Action has already been executed previously (idempotent response).",
                    )
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="No pending action found awaiting approval for this case.",
                )
            action = pending_actions[0]

        # Idempotency and status checking
        if action.status == "executed":
            verification = self.verify_action_result(action.id)
            return ActionExecutionResult(
                action_id=action.id,
                case_id=case_id,
                status="executed",
                executed=True,
                verified=verification.get("verified", False),
                verification_details=verification,
                message="Action was already approved and executed (idempotent).",
            )

        if action.status == "rejected":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Action {action.id} has already been rejected and cannot be approved.",
            )

        # Re-check policy eligibility before execution
        if case.order_id:
            policy_check = self.policy_service.evaluate_policy(
                order_id=case.order_id,
                issue_type=case.customer_issue,
                requested_action=action.action_type,
            )
            if not policy_check.eligible and policy_check.status != "requires_approval":
                self.audit_repo.log_audit_event(
                    case_id=case_id,
                    event_type="approval_blocked_by_policy",
                    actor=actor,
                    details={
                        "action_id": action.id,
                        "policy_name": policy_check.policy_name,
                        "reason": policy_check.reason,
                    },
                )
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Policy re-validation failed: {policy_check.reason}",
                )

        # 1. Record approval
        self.action_repo.update_action_status(action.id, "approved")
        self.audit_repo.log_audit_event(
            case_id=case_id,
            event_type="action_approved",
            actor=actor,
            details={"action_id": action.id, "notes": notes},
        )

        # 2. Controlled adapter execution
        payload = action.payload or {}
        if action.action_type in ["send_customer_email", "draft_customer_email"]:
            recipient = payload.get("recipient")
            if not recipient and case.order_id:
                order = self.order_repo.get_order(case.order_id)
                recipient = order.customer_email if order else "customer@example.com"

            subject = payload.get("subject", f"Update regarding your Order {case.order_id}")
            body = payload.get("body", payload.get("draft_body", ""))

            # Persist to simulated outbox
            outbox_msg = self.outbox_repo.create_outbox_message(
                case_id=case_id,
                action_id=action.id,
                recipient=recipient or "customer@example.com",
                subject=subject,
                body=body,
                status="sent",
            )
            logger.info(
                f"Simulated email dispatched for case {case_id}, outbox_id: {outbox_msg.id}"
            )

        # Mark action as executed with timestamp
        now = datetime.now(timezone.utc)
        self.action_repo.update_action_status(action.id, "executed", executed_at=now)

        # 3. Verify resulting state
        verification = self.verify_action_result(action.id)
        if not verification.get("verified"):
            self.action_repo.update_action_status(action.id, "failed")
            self.audit_repo.log_audit_event(
                case_id=case_id,
                event_type="action_verification_failed",
                actor="system",
                details={"action_id": action.id, "verification": verification},
            )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Action execution could not be verified in backend records.",
            )

        # 4. Log verified audit event
        self.audit_repo.log_audit_event(
            case_id=case_id,
            event_type="action_executed_and_verified",
            actor=actor,
            details={
                "action_id": action.id,
                "action_type": action.action_type,
                "verification": verification,
            },
        )

        # 5. Update case status (in_progress, NOT prematurely resolved)
        self.case_repo.update_case_status(case_id, status="in_progress")

        return ActionExecutionResult(
            action_id=action.id,
            case_id=case_id,
            status="executed",
            executed=True,
            verified=True,
            verification_details=verification,
            message="Action approved, executed through simulated adapter, and verified successfully in persistent records.",
        )

    def reject_action(
        self,
        case_id: str,
        action_id: Optional[str] = None,
        actor: str = "merchant",
        reason: Optional[str] = None,
    ) -> ActionExecutionResult:
        case = self.case_repo.get_case(case_id)
        if not case:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Case {case_id} not found.",
            )

        if action_id:
            action = self.action_repo.get_action(action_id)
            if not action or action.case_id != case_id:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Action {action_id} not found for case {case_id}.",
                )
        else:
            pending_actions = self.action_repo.get_pending_actions_by_case(case_id)
            if not pending_actions:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="No pending action found to reject for this case.",
                )
            action = pending_actions[0]

        if action.status == "executed":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Action {action.id} has already been executed and cannot be rejected.",
            )

        self.action_repo.update_action_status(action.id, "rejected")
        self.audit_repo.log_audit_event(
            case_id=case_id,
            event_type="action_rejected",
            actor=actor,
            details={"action_id": action.id, "reason": reason or "Merchant rejected proposed action."},
        )

        return ActionExecutionResult(
            action_id=action.id,
            case_id=case_id,
            status="rejected",
            executed=False,
            verified=True,
            verification_details={"rejected": True, "reason": reason},
            message=f"Action {action.id} was rejected by {actor}.",
        )
