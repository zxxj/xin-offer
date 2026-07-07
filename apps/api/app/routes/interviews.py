from fastapi import APIRouter, Body, HTTPException
from app.schemas.interviews import CreateInterviewRequest, CreateInterviewResponse, SubmitAnswerRequest, SubmitAnswerResponse,FinishInterviewRequest, FinishInterviewResponse
from app.services.interviews_service import create_interview_service, submit_answer_service, finish_interview_service
from json import JSONDecodeError
from app.client.openai_client import OpenAIInvokeError
from pydantic import ValidationError
from app.stores.interview_store import InterviewSessionNotFoundError


router = APIRouter()

@router.post("/interviews", response_model=CreateInterviewResponse)
def create_interview(data: CreateInterviewRequest):
  try:
    return create_interview_service(data)
  except OpenAIInvokeError as error:
    raise HTTPException(status_code=502,detail="AI服务暂时不可用,请稍后重试!") from error

  except Exception as error:
    raise HTTPException(status_code=500,detail="创建面试失败,请重试!") from error


# 三轮对话.
@router.post("/interviews/{interview_id}/messages", response_model=SubmitAnswerResponse)
def submit_answer(interview_id: str, data: SubmitAnswerRequest):
  try: 
    return submit_answer_service(interview_id, data)
  
  except InterviewSessionNotFoundError as error:
    raise HTTPException(status_code=404, detail="面试会话不存在!") from error

  except OpenAIInvokeError as error:
    raise HTTPException(status_code=502,detail="AI服务暂时不可用,请稍后重试!") from error
  
  except Exception as error:
    raise HTTPException(status_code=500,detail="提交回答失败,请重试!") from error
  
# 面试反馈与总结.
@router.post("/interviews/{interview_id}/finish", response_model=FinishInterviewResponse)
def finish_interview(interview_id: str, data: FinishInterviewRequest = Body(default_factory=FinishInterviewRequest)):
  try: 
    return finish_interview_service(interview_id, data)
  
  except InterviewSessionNotFoundError as error:
    raise HTTPException(status_code=404, detail="面试会话不存在!") from error

  except OpenAIInvokeError as error:
    raise HTTPException(status_code=502,detail="AI服务暂时不可用,请稍后重试!") from error
  
  except (JSONDecodeError, ValueError, ValidationError) as error:
    raise HTTPException(status_code=502,detail="模型返回的结果格式不正确,请重试!") from error
  
  except Exception as error:
    raise HTTPException(status_code=500,detail="生成面试结果失败,请重试!") from error