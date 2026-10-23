from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.agent_service import AgentService
from app.schemas.agent import AgentRunRequest, AgentRunResponse

router = APIRouter(prefix="/api/agent", tags=["Agent"])


@router.post("/run", response_model=AgentRunResponse)
def run_agent(request: AgentRunRequest, db: Session = Depends(get_db)):
    """
    Executes the ResolveLoop AI resolution assistant workflow.
    Understands the merchant request, looks up orders and shipping, verifies policy,
    generates evidence-based recommendations, prepares draft actions awaiting approval,
    schedules follow-ups, and logs audit events.
    """
    agent_service = AgentService(db)
    return agent_service.run(message=request.message, case_id=request.caseId)
