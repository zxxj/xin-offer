from openai import OpenAI
from app.core.config import settings
from app.prompts.chat import build_chat_prompt
from app.schemas.chat import ChatRequest, ChatResponse

client = OpenAI(api_key=settings.openai_api_key, base_url=settings.openai_base_url)

def chat_service(data: ChatRequest) -> ChatResponse:
  response = client.responses.create(
    model=settings.openai_model_name,
    input=build_chat_prompt(data)
  )

  return ChatResponse(reply=response.output_text)