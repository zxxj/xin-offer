import json

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.chat import chat_service, chat_stream_service
from app.client.openai_client import OpenAIInvokeError

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
def chat(data: ChatRequest) -> ChatResponse:
    try:
        return chat_service(data)
    except OpenAIInvokeError as error:
        raise HTTPException(
            status_code=502,
            detail="AI服务暂时不可用,请稍后重试!",
        ) from error

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail="聊天失败,请重试!",
        ) from error


@router.post("/chat/stream")
def chat_stream(data: ChatRequest):
    def generate():
        try:
            for delta in chat_stream_service(data):
                payload = json.dumps({"delta": delta}, ensure_ascii=False)
                yield f"event: message\ndata: {payload}\n\n"

        except OpenAIInvokeError:
            payload = json.dumps(
                {"message": "AI服务暂时不可用,请稍后重试!"},
                ensure_ascii=False,
            )
            yield f"event: error\ndata: {payload}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache"},
    )
