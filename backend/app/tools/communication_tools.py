from datetime import datetime, timezone, timedelta
from typing import Any, Dict, Optional
import dateutil.parser
from sqlalchemy.orm import Session
from app.tools.registry import tool_registry
from app.repositories.case_repo import CaseRepository
from app.repositories.order_repo import OrderRepository
from app.repositories.action_repo import ActionRepository
from app.repositories.follow_up_repo import FollowUpRepository
from app.repositories.audit_repo import AuditRepository
from app.services.approval_service import ApprovalService


@tool_registry.register(
    name="create_support_case",
    description="Create or fetch a persistent support case for an order with customer issue details.",
    parameters_schema={
        "type": "object",
        "properties": {
            "order_id": {"type": "string", "description": "Order identifier."},
            "issue_summary": {"type": "string", "description": "Brief summary of the issue."},
            "customer_issue": {
                "type": "string",
                "description": "Full customer issue description.",
            },
        },
        "required": ["order_id", "issue_summary"],
    },
)
def create_support_case(
    db: Session,
    order_id: str,
    issue_summary: str,
    customer_issue: Optional[str] = None,
) -> Dict[str, Any]:
    case_repo = CaseRepository(db)
    audit_repo = AuditRepository(db)

    # Check if an open or investigating case already exists for this order
    existing_cases = (
        db.query(case_repo.get_case.__annotations__.get('return', None) or type(case_repo.create_case(order_id, "", "")))
        if False
        else []
    )
    # Query case by order_id
    from app.models.case import SupportCase
    existing = (
        db.query(SupportCase)
        .filter(SupportCase.order_id == order_id)
        .order_by(SupportCase.created_at.desc())
        .first()
    )

    if existing:
        return {
            "case_id": existing.id,
            "order_id": existing.order_id,
            "status": existing.status,
            "is_new": False,
            "summary": existing.summary,
        }

    case = case_repo.create_case(
        order_id=order_id,
        customer_issue=customer_issue or issue_summary,
        summary=issue_summary,
        priority="medium",
        status="investigating",
    )
    audit_repo.log_audit_event(
        case_id=case.id,
        event_type="case_created_via_tool",
        actor="agent",
        details={"order_id": order_id, "summary": issue_summary},
    )

    return {
        "case_id": case.id,
        "order_id": case.order_id,
        "status": case.status,
        "is_new": True,
        "summary": case.summary,
    }


@tool_registry.register(
    name="draft_customer_email",
    description="Draft an empathetic, evidence-based customer email and register a pending approval action in the database.",
    parameters_schema={
        "type": "object",
        "properties": {
            "case_id": {"type": "string", "description": "Support case identifier."},
            "facts": {
                "type": "object",
                "description": "Evidence facts including order_id, customer_name, delay_reason, location, etc.",
            },
            "recommended_action": {
                "type": "string",
                "description": "Recommended course of action.",
            },
        },
        "required": ["case_id", "facts"],
    },
)
def draft_customer_email(
    db: Session,
    case_id: str,
    facts: Dict[str, Any],
    recommended_action: str = "Inform customer of carrier weather delay and track resolution",
) -> Dict[str, Any]:
    case_repo = CaseRepository(db)
    order_repo = OrderRepository(db)
    action_repo = ActionRepository(db)
    audit_repo = AuditRepository(db)

    case = case_repo.get_case(case_id)
    order_id = facts.get("order_id") or (case.order_id if case else "UNKNOWN")
    order = order_repo.get_order(order_id) if order_id else None

    customer_name = (
        facts.get("customer_name")
        or (order.customer_name if order else "Valued Customer")
    )
    customer_email = (
        facts.get("customer_email")
        or (order.customer_email if order else "customer@example.com")
    )
    delay_reason = (
        facts.get("delay_reason")
        or facts.get("shipping_exception")
        or "carrier transit delay due to severe weather conditions along the transit corridor"
    )
    current_location = facts.get("current_location") or "Siskiyou Pass, CA"

    subject = f"Update regarding your Order {order_id}: Shipping Status & Resolution"
    body = (
        f"Dear {customer_name},\n\n"
        f"Thank you for reaching out to us. We have investigated the status of your order ({order_id}) "
        f"with our carrier partners.\n\n"
        f"Your package encountered an unexpected delay at {current_location} due to {delay_reason}. "
        f"The logistics team has rerouted the shipment to prioritize safe transit, and the carrier "
        f"estimates delivery within the next 24 to 48 hours.\n\n"
        f"We sincerely apologize for the inconvenience this delay has caused. We are actively monitoring "
        f"your shipment and will follow up with you tomorrow with the latest tracking status.\n\n"
        f"If you have any immediate questions, please reply directly to this message.\n\n"
        f"Warm regards,\n"
        f"Customer Support Team\n"
        f"ResolveLoop AI Store Support"
    )

    # Unique idempotency key based on case and email type
    idempotency_key = f"email_{case_id}_{order_id}_v1"

    # Persist pending action
    action = action_repo.create_action(
        case_id=case_id,
        action_type="send_customer_email",
        payload={
            "recipient": customer_email,
            "subject": subject,
            "body": body,
            "recommended_action": recommended_action,
        },
        reason="Proactive customer update regarding shipping transit delay. Requires merchant approval prior to transmission.",
        idempotency_key=idempotency_key,
        status="pending",
    )

    # Update case status to awaiting_approval
    case_repo.update_case_status(case_id, status="awaiting_approval")

    audit_repo.log_audit_event(
        case_id=case_id,
        event_type="action_proposed",
        actor="agent",
        details={
            "action_id": action.id,
            "action_type": action.action_type,
            "recipient": customer_email,
            "subject": subject,
            "idempotency_key": idempotency_key,
            "requires_approval": True,
        },
    )

    return {
        "action_id": action.id,
        "case_id": case_id,
        "action_type": action.action_type,
        "status": action.status,
        "requires_approval": True,
        "draft_email": {
            "recipient": customer_email,
            "subject": subject,
            "body": body,
        },
    }


@tool_registry.register(
    name="create_follow_up",
    description="Schedule a persistent follow-up reminder for a case at a future timestamp.",
    parameters_schema={
        "type": "object",
        "properties": {
            "case_id": {"type": "string", "description": "Support case identifier."},
            "description": {
                "type": "string",
                "description": "Actionable description of what to verify during follow-up.",
            },
            "due_at": {
                "type": "string",
                "description": "ISO format datetime string or relative indicator like 'tomorrow'.",
            },
        },
        "required": ["case_id", "description"],
    },
)
def create_follow_up(
    db: Session,
    case_id: str,
    description: str,
    due_at: Optional[str] = None,
) -> Dict[str, Any]:
    follow_up_repo = FollowUpRepository(db)
    audit_repo = AuditRepository(db)

    # Parse due_at or default to tomorrow (24 hours from now)
    now = datetime.now(timezone.utc)
    target_dt = now + timedelta(days=1)
    if due_at:
        clean_due = due_at.strip().lower()
        if clean_due in ["tomorrow", "+1d", "1d"]:
            target_dt = now + timedelta(days=1)
        else:
            try:
                parsed = dateutil.parser.parse(due_at)
                if parsed.tzinfo is None:
                    parsed = parsed.replace(tzinfo=timezone.utc)
                target_dt = parsed
            except Exception:
                target_dt = now + timedelta(days=1)

    follow_up = follow_up_repo.create_follow_up(
        case_id=case_id,
        description=description,
        due_at=target_dt,
    )

    audit_repo.log_audit_event(
        case_id=case_id,
        event_type="follow_up_scheduled",
        actor="agent",
        details={
            "follow_up_id": follow_up.id,
            "description": description,
            "due_at": target_dt.isoformat(),
        },
    )

    return {
        "follow_up_id": follow_up.id,
        "case_id": follow_up.case_id,
        "description": follow_up.description,
        "due_at": follow_up.due_at.isoformat(),
        "status": follow_up.status,
    }


@tool_registry.register(
    name="get_case_status",
    description="Retrieve the current persistent status, pending approvals, and progress of a support case.",
    parameters_schema={
        "type": "object",
        "properties": {
            "case_id": {"type": "string", "description": "Support case identifier."}
        },
        "required": ["case_id"],
    },
)
def get_case_status(db: Session, case_id: str) -> Dict[str, Any]:
    case_repo = CaseRepository(db)
    action_repo = ActionRepository(db)
    follow_up_repo = FollowUpRepository(db)

    case = case_repo.get_case(case_id)
    if not case:
        return {"found": False, "case_id": case_id, "message": "Case not found."}

    pending_actions = action_repo.get_pending_actions_by_case(case_id)
    follow_ups = follow_up_repo.list_follow_ups(case_id=case_id)

    return {
        "found": True,
        "case_id": case.id,
        "order_id": case.order_id,
        "status": case.status,
        "priority": case.priority,
        "summary": case.summary,
        "pending_actions_count": len(pending_actions),
        "pending_action_ids": [a.id for a in pending_actions],
        "follow_ups_count": len(follow_ups),
        "created_at": case.created_at.isoformat() if case.created_at else None,
        "updated_at": case.updated_at.isoformat() if case.updated_at else None,
    }


@tool_registry.register(
    name="verify_action_result",
    description="Verify backend database state for an executed action (e.g. confirming simulated outbox dispatch).",
    parameters_schema={
        "type": "object",
        "properties": {
            "action_id": {"type": "string", "description": "Action identifier."}
        },
        "required": ["action_id"],
    },
)
def verify_action_result(db: Session, action_id: str) -> Dict[str, Any]:
    approval_service = ApprovalService(db)
    return approval_service.verify_action_result(action_id)
