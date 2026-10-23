from typing import Optional
from sqlalchemy.orm import Session
from app.providers import get_ai_provider
from app.repositories.case_repo import CaseRepository
from app.repositories.order_repo import OrderRepository
from app.repositories.action_repo import ActionRepository
from app.repositories.follow_up_repo import FollowUpRepository
from app.repositories.message_repo import MessageRepository
from app.repositories.audit_repo import AuditRepository
from app.schemas.agent import AgentRunResponse, ToolExecutionResultSchema
from app.schemas.order import OrderRead
from app.schemas.action import ProposedActionRead
from app.schemas.follow_up import FollowUpRead
from app.schemas.audit import AuditEventRead
from app.core.logging import logger


class AgentService:
    def __init__(self, db: Session):
        self.db = db
        self.case_repo = CaseRepository(db)
        self.order_repo = OrderRepository(db)
        self.action_repo = ActionRepository(db)
        self.follow_up_repo = FollowUpRepository(db)
        self.message_repo = MessageRepository(db)
        self.audit_repo = AuditRepository(db)
        self.provider = get_ai_provider()

    def run(self, message: str, case_id: Optional[str] = None) -> AgentRunResponse:
        # If case exists, log incoming user message
        if case_id:
            existing_case = self.case_repo.get_case(case_id)
            if existing_case:
                self.message_repo.add_message(case_id, role="user", content=message)

        # Run provider workflow
        result = self.provider.run_agent(message=message, case_id=case_id, db=self.db)
        final_case_id = result.get("case_id")

        # Persist messages if newly created case
        if final_case_id and not case_id:
            self.message_repo.add_message(final_case_id, role="user", content=message)

        # Persist assistant response message
        assistant_msg = result.get("assistant_message", "")
        if final_case_id and assistant_msg:
            self.message_repo.add_message(
                final_case_id, role="assistant", content=assistant_msg
            )

        # Retrieve updated records from DB
        case = self.case_repo.get_case(final_case_id) if final_case_id else None
        order = (
            self.order_repo.get_order(case.order_id)
            if case and case.order_id
            else None
        )

        proposed_actions = (
            self.action_repo.get_pending_actions_by_case(final_case_id)
            if final_case_id
            else []
        )
        # If no pending actions, get all actions for the case
        if not proposed_actions and case:
            proposed_actions = case.proposed_actions

        follow_ups = (
            self.follow_up_repo.list_follow_ups(case_id=final_case_id)
            if final_case_id
            else []
        )
        audit_events = (
            self.audit_repo.get_audit_events_by_case(final_case_id)
            if final_case_id
            else []
        )

        # Format schemas
        order_read = OrderRead.model_validate(order) if order else None
        actions_read = [
            ProposedActionRead.model_validate(a) for a in proposed_actions
        ]
        follow_up_read = (
            FollowUpRead.model_validate(follow_ups[-1]) if follow_ups else None
        )
        audit_events_read = [
            AuditEventRead.model_validate(e) for e in audit_events
        ]
        tool_results_read = [
            ToolExecutionResultSchema(**tr)
            for tr in result.get("tool_execution_results", [])
        ]

        approval_requirements = {
            "has_pending_approval": any(a.status == "pending" for a in actions_read),
            "pending_action_count": len([a for a in actions_read if a.status == "pending"]),
            "policy_rule": "External customer communication and financial concessions require merchant approval before execution.",
        }

        return AgentRunResponse(
            caseId=final_case_id or "NONE",
            assistantMessage=assistant_msg,
            order=order_read,
            toolExecutionResults=tool_results_read,
            evidence=result.get("evidence", {}),
            policyDecision=result.get("policy_decision", {}),
            recommendation=result.get("recommendation", ""),
            proposedActions=actions_read,
            approvalRequirements=approval_requirements,
            followUpDetails=follow_up_read,
            currentCaseStatus=case.status if case else "open",
            auditEvents=audit_events_read,
        )
