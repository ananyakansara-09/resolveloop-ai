from app.core.config import settings
from app.providers.base import BaseAIProvider
from app.providers.mock_provider import MockProvider
from app.providers.bedrock_provider import BedrockProvider


def get_ai_provider() -> BaseAIProvider:
    provider_name = (settings.AI_PROVIDER or "mock").lower()
    if provider_name == "bedrock":
        return BedrockProvider()
    return MockProvider()


__all__ = [
    "BaseAIProvider",
    "MockProvider",
    "BedrockProvider",
    "get_ai_provider",
]
