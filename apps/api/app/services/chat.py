from collections.abc import Generator

from app.prompts.chat import build_chat_prompt
from app.schemas.chat import ChatRequest, ChatResponse
from app.client.openai_client import invoke, stream_invoke


def chat_service(data: ChatRequest) -> ChatResponse:
    response = invoke(build_chat_prompt(data))
    return ChatResponse(reply=response)


def chat_stream_service(data: ChatRequest) -> Generator[str, None, None]:
    return stream_invoke(build_chat_prompt(data))
