from app.prompts.chat import build_chat_prompt
from app.schemas.chat import ChatRequest, ChatResponse
from app.client.openai_client import invoke

def chat_service(data: ChatRequest) -> ChatResponse:
  response = invoke(build_chat_prompt(data))
  return ChatResponse(reply=response)
