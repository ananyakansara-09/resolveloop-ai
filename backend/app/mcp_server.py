"""
ResolveLoop AI - Official MCP (Model Context Protocol) Server.
Exposes the validated tool registry through the official MCP Python SDK
with support for Streamable HTTP transport.
Reuses the exact same business services and database repositories.
"""
from typing import Any, Dict, Optional
from mcp.server.mcpserver import MCPServer
from app.db.session import SessionLocal
from app.tools.registry import tool_registry
import app.tools  # ensure all tools are loaded
from app.core.logging import logger

mcp = MCPServer("resolveloop-ai", version="1.0.0")


@mcp.tool(
    name="lookup_order",
    description="Retrieve order details including customer, items, amount and current status.",
)
def mcp_lookup_order(order_id: str) -> Dict[str, Any]:
    with SessionLocal() as db:
        res = tool_registry.execute("lookup_order", db, {"order_id": order_id})
        return res.output if res.status == "success" else {"error": res.error}


@mcp.tool(
    name="get_shipping_status",
    description="Retrieve carrier shipping timeline, tracking status and transit exception events for an order.",
)
def mcp_get_shipping_status(order_id: str) -> Dict[str, Any]:
    with SessionLocal() as db:
        res = tool_registry.execute("get_shipping_status", db, {"order_id": order_id})
        return res.output if res.status == "success" else {"error": res.error}


@mcp.tool(
    name="check_store_policy",
    description="Deterministically evaluate store policy guidelines and constraints for an order.",
)
def mcp_check_store_policy(
    order_id: str,
    issue_type: str,
    requested_action: str,
) -> Dict[str, Any]:
    with SessionLocal() as db:
        res = tool_registry.execute(
            "check_store_policy",
            db,
            {
                "order_id": order_id,
                "issue_type": issue_type,
                "requested_action": requested_action,
            },
        )
        return res.output if res.status == "success" else {"error": res.error}


@mcp.tool(
    name="create_support_case",
    description="Create or fetch a persistent support case for an order.",
)
def mcp_create_support_case(
    order_id: str,
    issue_summary: str,
    customer_issue: Optional[str] = None,
) -> Dict[str, Any]:
    with SessionLocal() as db:
        res = tool_registry.execute(
            "create_support_case",
            db,
            {
                "order_id": order_id,
                "issue_summary": issue_summary,
                "customer_issue": customer_issue,
            },
        )
        return res.output if res.status == "success" else {"error": res.error}


@mcp.tool(
    name="draft_customer_email",
    description="Draft an empathetic customer email and register a pending approval action in the database.",
)
def mcp_draft_customer_email(
    case_id: str,
    facts: Dict[str, Any],
    recommended_action: str = "Inform customer of carrier weather delay",
) -> Dict[str, Any]:
    with SessionLocal() as db:
        res = tool_registry.execute(
            "draft_customer_email",
            db,
            {
                "case_id": case_id,
                "facts": facts,
                "recommended_action": recommended_action,
            },
        )
        return res.output if res.status == "success" else {"error": res.error}


@mcp.tool(
    name="create_follow_up",
    description="Schedule a persistent follow-up reminder for a case at a future timestamp.",
)
def mcp_create_follow_up(
    case_id: str,
    description: str,
    due_at: Optional[str] = None,
) -> Dict[str, Any]:
    with SessionLocal() as db:
        res = tool_registry.execute(
            "create_follow_up",
            db,
            {
                "case_id": case_id,
                "description": description,
                "due_at": due_at,
            },
        )
        return res.output if res.status == "success" else {"error": res.error}


@mcp.tool(
    name="get_case_status",
    description="Retrieve the current persistent status, pending approvals, and progress of a support case.",
)
def mcp_get_case_status(case_id: str) -> Dict[str, Any]:
    with SessionLocal() as db:
        res = tool_registry.execute("get_case_status", db, {"case_id": case_id})
        return res.output if res.status == "success" else {"error": res.error}


@mcp.tool(
    name="verify_action_result",
    description="Verify backend database state for an executed action (e.g. simulated outbox dispatch).",
)
def mcp_verify_action_result(action_id: str) -> Dict[str, Any]:
    with SessionLocal() as db:
        res = tool_registry.execute("verify_action_result", db, {"action_id": action_id})
        return res.output if res.status == "success" else {"error": res.error}


if __name__ == "__main__":
    import asyncio
    print("Starting ResolveLoop AI MCP Server (Streamable HTTP)...")
    asyncio.run(mcp.run_streamable_http_async(host="127.0.0.1", port=8001))
