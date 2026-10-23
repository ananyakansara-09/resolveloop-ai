from abc import ABC, abstractmethod
from typing import Any, Dict, Optional
from sqlalchemy.orm import Session


class BaseAIProvider(ABC):
    @abstractmethod
    def run_agent(
        self,
        message: str,
        case_id: Optional[str],
        db: Session,
    ) -> Dict[str, Any]:
        """
        Orchestrate tool calling and reasoning loop.
        Returns a structured dictionary with keys:
          - case_id: str
          - assistant_message: str
          - evidence: Dict[str, Any]
          - policy_decision: Dict[str, Any]
          - recommendation: str
          - tool_execution_results: List[Dict[str, Any]]
          - proposed_action_id: Optional[str]
          - follow_up_id: Optional[str]
        """
        pass
