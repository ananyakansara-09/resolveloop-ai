from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.case_service import CaseService
from app.services.approval_service import ApprovalService
from app.schemas.case import CaseRead, CaseDetailRead, CaseListResponse, CaseCreate
from app.schemas.action import (
    ActionApprovalRequest,
    ActionRejectionRequest,
    ActionExecutionResult,
)

router = APIRouter(prefix="/api/cases", tags=["Cases & Approvals"])


@router.get("", response_model=CaseListResponse)
def list_cases(
    status: Optional[str] = Query(None, description="Filter by case status"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db),
):
    """
    List support cases with status filtering and pagination.
    """
    case_service = CaseService(db)
    items, total = case_service.list_cases(status=status, page=page, limit=limit)
    return CaseListResponse(
        items=[CaseRead.model_validate(c) for c in items],
        total=total,
        page=page,
        limit=limit,
    )


@router.get("/{case_id}", response_model=CaseDetailRead)
def get_case_detail(case_id: str, db: Session = Depends(get_db)):
    """
    Retrieve full support case details including conversation history,
    proposed actions, follow-ups, and audit trail.
    """
    case_service = CaseService(db)
    case = case_service.get_case(case_id)
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Case '{case_id}' not found.",
        )
    return CaseDetailRead.model_validate(case)


@router.post("", response_model=CaseRead, status_code=status.HTTP_201_CREATED)
def create_case(case_in: CaseCreate, db: Session = Depends(get_db)):
    """
    Create a new persistent support case.
    """
    case_service = CaseService(db)
    case = case_service.create_case(
        order_id=case_in.order_id,
        customer_issue=case_in.customer_issue,
        summary=case_in.summary,
        priority=case_in.priority,
    )
    return CaseRead.model_validate(case)


@router.post("/{case_id}/approve", response_model=ActionExecutionResult)
def approve_case_action(
    case_id: str,
    payload: Optional[ActionApprovalRequest] = None,
    db: Session = Depends(get_db),
):
    """
    Approve and execute a pending consequential action for a case.
    Re-validates store policy rules, ensures idempotency, dispatches via controlled adapter,
    and verifies backend persistence.
    """
    approval_service = ApprovalService(db)
    action_id = payload.action_id if payload else None
    actor = payload.actor if payload else "merchant"
    notes = payload.notes if payload else None
    return approval_service.approve_action(
        case_id=case_id,
        action_id=action_id,
        actor=actor,
        notes=notes,
    )


@router.post("/{case_id}/reject", response_model=ActionExecutionResult)
def reject_case_action(
    case_id: str,
    payload: Optional[ActionRejectionRequest] = None,
    db: Session = Depends(get_db),
):
    """
    Explicitly reject a pending action for a case.
    """
    approval_service = ApprovalService(db)
    action_id = payload.action_id if payload else None
    actor = payload.actor if payload else "merchant"
    reason = payload.reason if payload else "Merchant rejected proposed action"
    return approval_service.reject_action(
        case_id=case_id,
        action_id=action_id,
        actor=actor,
        reason=reason,
    )
