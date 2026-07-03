# 闲聊相关.
from pydantic import BaseModel, Field

class ChatRequest(BaseModel):
  message: str = Field(min_length=1)

class ChatResponse(BaseModel):
  reply: str