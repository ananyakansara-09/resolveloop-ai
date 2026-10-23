import inspect
from typing import Any, Callable, Dict, List, Optional
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from app.core.logging import logger


class ToolDefinition(BaseModel):
    name: str
    description: str
    parameters: Dict[str, Any]


class ToolResult(BaseModel):
    tool_name: str
    status: str  # success, error
    output: Any
    error: Optional[str] = None


class ToolRegistry:
    def __init__(self):
        self._tools: Dict[str, Callable] = {}
        self._metadata: Dict[str, ToolDefinition] = {}

    def register(
        self,
        name: str,
        description: str,
        parameters_schema: Dict[str, Any],
    ):
        def decorator(func: Callable):
            self._tools[name] = func
            self._metadata[name] = ToolDefinition(
                name=name,
                description=description,
                parameters=parameters_schema,
            )
            return func

        return decorator

    def get_tool(self, name: str) -> Optional[Callable]:
        return self._tools.get(name)

    def list_tools(self) -> List[ToolDefinition]:
        return list(self._metadata.values())

    def get_bedrock_tool_specs(self) -> List[Dict[str, Any]]:
        """
        Formats registered tools for Amazon Bedrock Runtime Converse API toolConfig.
        """
        bedrock_tools = []
        for name, meta in self._metadata.items():
            bedrock_tools.append({
                "toolSpec": {
                    "name": name,
                    "description": meta.description,
                    "inputSchema": {
                        "json": meta.parameters
                    }
                }
            })
        return bedrock_tools

    def execute(self, name: str, db: Session, arguments: Dict[str, Any]) -> ToolResult:
        tool_func = self._tools.get(name)
        if not tool_func:
            return ToolResult(
                tool_name=name,
                status="error",
                output=None,
                error=f"Tool '{name}' is not registered or not in the allowlist.",
            )

        try:
            # Call tool with db session and kwargs
            result = tool_func(db=db, **arguments)
            return ToolResult(
                tool_name=name,
                status="success",
                output=result,
            )
        except Exception as e:
            logger.error(f"Error executing tool {name} with args {arguments}: {str(e)}", exc_info=True)
            return ToolResult(
                tool_name=name,
                status="error",
                output=None,
                error=str(e),
            )


tool_registry = ToolRegistry()
