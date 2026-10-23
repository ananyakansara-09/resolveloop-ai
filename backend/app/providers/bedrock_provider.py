import json
from typing import Any, Dict, List, Optional
from sqlalchemy.orm import Session
from app.providers.base import BaseAIProvider
from app.tools.registry import tool_registry
from app.core.config import settings
from app.core.logging import logger


class BedrockProvider(BaseAIProvider):
    """
    Amazon Bedrock AI Provider using the Converse API with native tool calling.
    Falls back gracefully if AWS credentials or model access are unavailable.
    """

    def __init__(self):
        self.region = settings.AWS_REGION or "us-east-1"
        self.model_id = settings.BEDROCK_MODEL_ID
        self._client = None

    def _get_client(self):
        if self._client is not None:
            return self._client
        import boto3

        client_kwargs = {"region_name": self.region}
        if settings.AWS_ACCESS_KEY_ID and settings.AWS_SECRET_ACCESS_KEY:
            client_kwargs["aws_access_key_id"] = settings.AWS_ACCESS_KEY_ID
            client_kwargs["aws_secret_access_key"] = settings.AWS_SECRET_ACCESS_KEY
            if settings.AWS_SESSION_TOKEN:
                client_kwargs["aws_session_token"] = settings.AWS_SESSION_TOKEN

        self._client = boto3.client("bedrock-runtime", **client_kwargs)
        return self._client

    def run_agent(
        self,
        message: str,
        case_id: Optional[str],
        db: Session,
    ) -> Dict[str, Any]:
        try:
            client = self._get_client()
        except Exception as e:
            logger.warning(
                f"Bedrock client initialization failed: {e}. Falling back to MockProvider."
            )
            from app.providers.mock_provider import MockProvider

            return MockProvider().run_agent(message, case_id, db)

        # Build tools config
        bedrock_tools = tool_registry.get_bedrock_tool_specs()
        system_prompt = (
            "You are ResolveLoop AI, an ecommerce customer-support resolution assistant. "
            "Your workflow: 1) Look up the order, 2) Retrieve shipping events, 3) Check applicable store policy, "
            "4) Create/verify support case, 5) Draft customer email response (requires explicit merchant approval), "
            "6) Schedule a follow-up task. "
            "Never bypass policy checks or invent eligibility. Always use tools to verify facts."
        )

        messages = [
            {
                "role": "user",
                "content": [
                    {
                        "text": f"User request: {message}\n(Active Case ID: {case_id or 'None'})"
                    }
                ],
            }
        ]

        tool_results_log: List[Dict[str, Any]] = []
        assistant_text = ""
        current_case_id = case_id
        proposed_action_id = None
        follow_up_id = None

        iterations = 0
        max_iterations = settings.MAX_AGENT_ITERATIONS

        try:
            while iterations < max_iterations:
                iterations += 1
                response = client.converse(
                    modelId=self.model_id,
                    messages=messages,
                    system=[{"text": system_prompt}],
                    toolConfig={"tools": bedrock_tools},
                )

                output_message = response.get("output", {}).get("message", {})
                stop_reason = response.get("stopReason")
                messages.append(output_message)

                # Process contents
                tool_requests = []
                for content_block in output_message.get("content", []):
                    if "text" in content_block:
                        assistant_text += content_block["text"] + "\n"
                    if "toolUse" in content_block:
                        tool_requests.append(content_block["toolUse"])

                if stop_reason == "tool_use" and tool_requests:
                    tool_result_contents = []
                    for req in tool_requests:
                        tool_use_id = req.get("toolUseId")
                        tool_name = req.get("name")
                        tool_input = req.get("input", {})

                        # Execute tool safely
                        result = tool_registry.execute(tool_name, db, tool_input)
                        tool_results_log.append({
                            "tool_name": tool_name,
                            "input_arguments": tool_input,
                            "status": result.status,
                            "output": result.output,
                            "error": result.error,
                        })

                        if tool_name == "create_support_case" and result.status == "success":
                            current_case_id = result.output.get("case_id")
                        elif tool_name == "draft_customer_email" and result.status == "success":
                            proposed_action_id = result.output.get("action_id")
                        elif tool_name == "create_follow_up" and result.status == "success":
                            follow_up_id = result.output.get("follow_up_id")

                        tool_result_contents.append({
                            "toolResult": {
                                "toolUseId": tool_use_id,
                                "content": [{"json": result.output if result.status == "success" else {"error": result.error}}],
                                "status": "success" if result.status == "success" else "error",
                            }
                        })

                    messages.append({
                        "role": "user",
                        "content": tool_result_contents,
                    })
                else:
                    break

        except Exception as e:
            logger.error(f"Amazon Bedrock Converse API error: {e}. Falling back to deterministic MockProvider.")
            from app.providers.mock_provider import MockProvider

            return MockProvider().run_agent(message, case_id, db)

        return {
            "case_id": current_case_id or "CASE-BEDROCK",
            "assistant_message": assistant_text.strip(),
            "evidence": {},
            "policy_decision": {},
            "recommendation": assistant_text.strip(),
            "tool_execution_results": tool_results_log,
            "proposed_action_id": proposed_action_id,
            "follow_up_id": follow_up_id,
        }
