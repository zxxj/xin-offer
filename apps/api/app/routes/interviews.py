from fastapi import APIRouter, HTTPException
from app.schemas.interviews import CreateInterviewRequest, CreateInterviewResponse, SubmitAnswerRequest, SubmitAnswerResponse,FinishInterviewRequest, FinishInterviewResponse
from app.services.interviews_service import create_interview_service, submit_answer_service, finish_interview_service

router = APIRouter()

@router.post("/interviews", response_model=CreateInterviewResponse)
def create_interview(data: CreateInterviewRequest):
  try:
    return create_interview_service(data)
  except Exception as error:
    raise HTTPException(
      status_code=500,
      detail="创建面试失败,请重试!"
    )from error


# 三轮对话.
@router.post("/interviews/{interview_id}/messages", response_model=SubmitAnswerResponse)
def submit_answer(interview_id: str, data: SubmitAnswerRequest):
  try: 
    return submit_answer_service(interview_id, data)
  except Exception as error:
    raise HTTPException(
      status_code=500,
      detail="提交回答失败,请重试!"
    )from error
  
# 面试反馈与总结.
@router.post("/interviews/{interview_id}/finish", response_model=FinishInterviewResponse)
def finish_interview(interview_id: str, data: FinishInterviewRequest):
  try: 
    return finish_interview_service(interview_id, data)
  except Exception as error:
    raise HTTPException(
      status_code=500,
      detail="生成面试反馈失败,请重试!"
    )from error