

from fastapi import APIRouter, HTTPException
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.chat import chat_service


router = APIRouter()

@router.post("/chat", response_model= ChatResponse)
def chat(data: ChatRequest) -> str:
  try:
    return chat_service(data)
  except Exception as error:
   raise HTTPException(
      status_code=500,
      detail="聊天失败,请重试!",
    )from error