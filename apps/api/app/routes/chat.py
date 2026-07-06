

from fastapi import APIRouter, HTTPException
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.chat import chat_service
from app.client.openai_client import OpenAIInvokeError


router = APIRouter()

@router.post("/chat", response_model=ChatResponse)
def chat(data: ChatRequest) -> ChatResponse:
  try:
    return chat_service(data)
  except OpenAIInvokeError as error:
    raise HTTPException(
      status_code=502,
      detail="AI服务暂时不可用,请稍后重试!"
    )from error
    
  except Exception as error:
   raise HTTPException(
      status_code=500,
      detail="聊天失败,请重试!",
    )from error