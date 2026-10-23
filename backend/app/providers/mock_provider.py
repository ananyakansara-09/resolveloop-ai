import re
from typing import Any, Dict, List, Optional
from sqlalchemy.orm import Session
from app.providers.base import BaseAIProvider
from app.tools.registry import tool_registry
from app.repositories.case_repo import CaseRepository
from app.core.logging import logger


class MockProvider(BaseAIProvider):
    """
    Deterministic AI Provider for local development, hackathon demos, and automated testing.
    Executes actual tools through the tool registry and persists state in the real database.
    """

    def run_agent(
        self,
        message: str,
        case_id: Optional[str],
        db: Session,
    ) -> Dict[str, Any]:
        tool_results: List[Dict[str, Any]] = []
        evidence: Dict[str, Any] = {}
        policy_decision: Dict[str, Any] = {}
        proposed_action_id: Optional[str] = None
        follow_up_id: Optional[str] = None
        current_case_id = case_id

        # 1. Detect order ID from message or existing case
        order_match = re.search(r"\b([A-Z]{2}-\d{3,6})\b", message, re.IGNORECASE)
        order_id = order_match.group(1).upper() if order_match else None

        case_repo = CaseRepository(db)
        if not order_id and current_case_id:
            existing_case = case_repo.get_case(current_case_id)
            if existing_case and existing_case.order_id:
                order_id = existing_case.order_id

        # 2. If order ID found, execute lookup tools
        order_info = None
        shipping_info = None

        if order_id:
            # Tool 1: lookup_order
            t1 = tool_registry.execute("lookup_order", db, {"order_id": order_id})
            tool_results.append({
                "tool_name": "lookup_order",
                "input_arguments": {"order_id": order_id},
                "status": t1.status,
                "output": t1.output,
                "error": t1.error,
            })
            if t1.status == "success" and t1.output.get("found"):
                order_info = t1.output
                evidence["order"] = order_info
            else:
                evidence["order_lookup_error"] = t1.output.get("message") if t1.output else "Order not found"

            # Tool 2: get_shipping_status
            t2 = tool_registry.execute("get_shipping_status", db, {"order_id": order_id})
            tool_results.append({
                "tool_name": "get_shipping_status",
                "input_arguments": {"order_id": order_id},
                "status": t2.status,
                "output": t2.output,
                "error": t2.error,
            })
            if t2.status == "success":
                shipping_info = t2.output
                evidence["shipping"] = shipping_info

            # Tool 3: check_store_policy
            issue_type = "shipping_delay" if shipping_info and shipping_info.get("is_delayed") else "general_inquiry"
            t3 = tool_registry.execute(
                "check_store_policy",
                db,
                {
                    "order_id": order_id,
                    "issue_type": issue_type,
                    "requested_action": "send_customer_email",
                },
            )
            tool_results.append({
                "tool_name": "check_store_policy",
                "input_arguments": {
                    "order_id": order_id,
                    "issue_type": issue_type,
                    "requested_action": "send_customer_email",
                },
                "status": t3.status,
                "output": t3.output,
                "error": t3.error,
            })
            if t3.status == "success":
                policy_decision = t3.output
                evidence["policy_check"] = policy_decision

        # 3. Handle Case creation or continuation
        if not current_case_id:
            summary = (
                f"Shipping transit investigation for order {order_id}"
                if order_id
                else f"Customer support request: {message[:50]}..."
            )
            t4 = tool_registry.execute(
                "create_support_case",
                db,
                {
                    "order_id": order_id or "UNKNOWN",
                    "issue_summary": summary,
                    "customer_issue": message,
                },
            )
            tool_results.append({
                "tool_name": "create_support_case",
                "input_arguments": {
                    "order_id": order_id or "UNKNOWN",
                    "issue_summary": summary,
                    "customer_issue": message,
                },
                "status": t4.status,
                "output": t4.output,
                "error": t4.error,
            })
            if t4.status == "success":
                current_case_id = t4.output.get("case_id")

        # 4. Draft email action if requested or appropriate
        wants_response = any(
            k in message.lower()
            for k in ["response", "email", "draft", "prepare", "customer response", "reply"]
        )
        if current_case_id and (wants_response or (shipping_info and shipping_info.get("is_delayed"))):
            delay_reason = "carrier weather delay"
            location = "Transit Hub"
            if shipping_info and shipping_info.get("latest_event"):
                latest_ev = shipping_info["latest_event"]
                delay_reason = latest_ev.get("description", delay_reason)
                location = latest_ev.get("location", location)

            facts = {
                "order_id": order_id,
                "customer_name": order_info.get("customer_name") if order_info else "Valued Customer",
                "customer_email": order_info.get("customer_email") if order_info else None,
                "delay_reason": delay_reason,
                "current_location": location,
            }

            t5 = tool_registry.execute(
                "draft_customer_email",
                db,
                {
                    "case_id": current_case_id,
                    "facts": facts,
                    "recommended_action": "Notify customer of carrier weather delay and provide revised delivery expectation.",
                },
            )
            tool_results.append({
                "tool_name": "draft_customer_email",
                "input_arguments": {
                    "case_id": current_case_id,
                    "facts": facts,
                },
                "status": t5.status,
                "output": t5.output,
                "error": t5.error,
            })
            if t5.status == "success":
                proposed_action_id = t5.output.get("action_id")

        # 5. Create follow-up if requested
        wants_followup = any(
            k in message.lower()
            for k in ["follow up", "follow-up", "tomorrow", "schedule", "unresolved"]
        )
        if current_case_id and wants_followup:
            followup_desc = (
                f"Verify carrier transit updates for order {order_id or 'shipment'} "
                f"and ensure delivery resolution within 24 hours."
            )
            t6 = tool_registry.execute(
                "create_follow_up",
                db,
                {
                    "case_id": current_case_id,
                    "description": followup_desc,
                    "due_at": "tomorrow",
                },
            )
            tool_results.append({
                "tool_name": "create_follow_up",
                "input_arguments": {
                    "case_id": current_case_id,
                    "description": followup_desc,
                    "due_at": "tomorrow",
                },
                "status": t6.status,
                "output": t6.output,
                "error": t6.error,
            })
            if t6.status == "success":
                follow_up_id = t6.output.get("follow_up_id")

        # 6. Formulate evidence-based recommendation & assistant response
        if order_id and order_info:
            is_delayed = shipping_info.get("is_delayed") if shipping_info else False
            latest_desc = (
                shipping_info.get("latest_event", {}).get("description")
                if shipping_info
                else "No tracking updates available"
            )
            location = (
                shipping_info.get("latest_event", {}).get("location")
                if shipping_info
                else "Transit corridor"
            )

            recommendation = (
                f"Order {order_id} is currently delayed due to: '{latest_desc}' at {location}. "
                f"Per Store Policy {policy_decision.get('policy_id', 'POL-SHIPPING-DELAY')}, full refunds are not permitted "
                f"while the item is in active carrier transit. The policy allows proactive customer notification, "
                f"which requires merchant approval before transmission. A follow-up task has been scheduled for tomorrow."
            )

            assistant_msg = (
                f"I have investigated order **{order_id}** for customer **{order_info.get('customer_name')}**.\n\n"
                f"### Findings:\n"
                f"- **Order Status:** {order_info.get('status').title()} (${order_info.get('total_amount')} {order_info.get('currency')})\n"
                f"- **Shipping Status:** Carrier transit exception at {location} ({latest_desc})\n"
                f"- **Policy Evaluation:** {policy_decision.get('reason', 'Compliant with delay policy')}\n\n"
                f"### Actions Prepared:\n"
                f"1. **Customer Email Draft:** Generated empathetic status update explaining the delay and expected delivery window. *(Awaiting your explicit merchant approval before transmission)*\n"
                f"2. **Follow-Up Scheduled:** Automatic verification scheduled for tomorrow to check carrier rerouting progress.\n\n"
                f"Please review and approve the pending email action below to dispatch the customer notification."
            )
        elif order_id and not order_info:
            recommendation = f"Order {order_id} was not found in the records. Manual merchant verification required."
            assistant_msg = (
                f"I attempted to look up order **{order_id}**, but no matching records were found in the database. "
                f"Please verify the order ID or provide additional customer details."
            )
        else:
            recommendation = "Customer inquiry received. General case opened for merchant review."
            assistant_msg = (
                f"I have recorded your request in support case **{current_case_id}**. "
                f"If you have a specific Order ID (such as `KL-1042`), please provide it so I can investigate the shipping and policy status."
            )

        return {
            "case_id": current_case_id or "CASE-NONE",
            "assistant_message": assistant_msg,
            "evidence": evidence,
            "policy_decision": policy_decision,
            "recommendation": recommendation,
            "tool_execution_results": tool_results,
            "proposed_action_id": proposed_action_id,
            "follow_up_id": follow_up_id,
        }
