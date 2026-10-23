from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict
from app.schemas.order import OrderRead
from app.schemas.action import ProposedActionRead
from app.schemas.follow_up import FollowUpRead
from app.schemas.audit import AuditEventRead


class AgentRunRequest(BaseModel):
    message: str
    caseId: Optional[str] = None


class ToolExecutionResultSchema(BaseModel):
    tool_name: str
    input_arguments: Dict[str, Any]
    status: str  # success, error, filtered
    output: Any
    error: Optional[str] = None


class AgentRunResponse(BaseModel):
    caseId: str
    assistantMessage: str
    order: Optional[OrderRead] = None
    toolExecutionResults: List[ToolExecutionResultSchema] = []
    evidence: Dict[str, Any] = {}
    policyDecision: Dict[str, Any] = {}
    recommendation: str
    proposedActions: List[ProposedActionRead] = []
    approvalRequirements: Dict[str, Any] = {}
    followUpDetails: Optional[FollowUpRead] = None
    currentCaseStatus: str
    auditEvents: List[AuditEventRead] = []
