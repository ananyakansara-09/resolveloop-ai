from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.follow_up_service import FollowUpService
from app.schemas.follow_up import FollowUpRead, FollowUpCreate, FollowUpUpdate

router = APIRouter(tags=["Follow-ups"])


@router.get("/api/follow-ups", response_model=List[FollowUpRead])
def list_follow_ups(
    status: Optional[str] = Query(None, description="Filter by status (pending, in_progress, completed)"),
    case_id: Optional[str] = Query(None, description="Filter by case ID"),
    db: Session = Depends(get_db),
):
    """
    List scheduled follow-up tasks with optional status and case filtering.
    """
    service = FollowUpService(db)
    items = service.list_follow_ups(status=status, case_id=case_id)
    return [FollowUpRead.model_validate(f) for f in items]


@router.post(
    "/api/cases/{case_id}/follow-ups",
    response_model=FollowUpRead,
    status_code=status.HTTP_201_CREATED,
)
def create_case_follow_up(
    case_id: str,
    payload: FollowUpCreate,
    db: Session = Depends(get_db),
):
    """
    Schedule a new follow-up task for a support case.
    """
    service = FollowUpService(db)
    follow_up = service.create_follow_up(
        case_id=case_id,
        description=payload.description,
        due_at=payload.due_at,
    )
    return FollowUpRead.model_validate(follow_up)


@router.patch("/api/follow-ups/{follow_up_id}", response_model=FollowUpRead)
def update_follow_up(
    follow_up_id: str,
    payload: FollowUpUpdate,
    db: Session = Depends(get_db),
):
    """
    Update follow-up task description, due date or status (e.g. mark completed).
    """
    service = FollowUpService(db)
    updated = service.update_follow_up(
        follow_up_id=follow_up_id,
        description=payload.description,
        due_at=payload.due_at,
        status_val=payload.status,
    )
    return FollowUpRead.model_validate(updated)
