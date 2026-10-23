from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.repositories.case_repo import CaseRepository
from app.repositories.follow_up_repo import FollowUpRepository
from app.schemas.dashboard import DashboardStatsResponse, DashboardRecentCase

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("", response_model=DashboardStatsResponse)
def get_dashboard_stats(db: Session = Depends(get_db)):
    """
    Returns live aggregated case metrics, pending approvals count,
    resolved cases, due follow-ups, and recent cases directly from the database.
    """
    case_repo = CaseRepository(db)
    follow_up_repo = FollowUpRepository(db)

    total_cases = case_repo.count_total_cases()
    awaiting_approval = case_repo.count_cases_by_status("awaiting_approval")
    resolved_cases = case_repo.count_cases_by_status("resolved")
    follow_ups_due = follow_up_repo.count_due_follow_ups(as_of=datetime.now(timezone.utc))
    recent_cases_entities = case_repo.get_recent_cases(limit=10)

    recent_cases = [
        DashboardRecentCase(
            id=c.id,
            order_id=c.order_id,
            summary=c.summary,
            status=c.status,
            priority=c.priority,
            created_at=c.created_at,
        )
        for c in recent_cases_entities
    ]

    return DashboardStatsResponse(
        total_cases=total_cases,
        cases_awaiting_approval=awaiting_approval,
        resolved_cases=resolved_cases,
        follow_ups_due=follow_ups_due,
        recent_cases=recent_cases,
    )
