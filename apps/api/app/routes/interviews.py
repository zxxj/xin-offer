from fastapi import APIRouter, Body, HTTPException, Depends
from app.schemas.interviews import (
    CreateInterviewRequest,
    CreateInterviewResponse,
    InterviewItem,
    SubmitAnswerRequest,
    SubmitAnswerResponse,
    FinishInterviewRequest,
    FinishInterviewResponse,
    InterviewMessageItem,
)
from app.services.interviews_service import (
    create_interview_service,
    get_interview_detail_service,
    get_interview_message_service,
    get_interview_report_service,
    list_interviews_service,
    submit_answer_service,
    finish_interview_service,
)
from json import JSONDecodeError
from app.client.openai_client import OpenAIInvokeError
from pydantic import ValidationError
from app.errors.interviews import InterviewNotFoundError, InterviewReportNotFoundError
from sqlalchemy.orm import Session
from app.db.deps import get_db

router = APIRouter()


# 查询面试会话列表.
@router.get("/interviews", response_model=list[InterviewItem])
def list_interview(db: Session = Depends(get_db)):
    try:
        return list_interviews_service(db)
    except Exception as error:
        raise HTTPException(
            status_code=500, detail="查询面试历史失败,请重试!"
        ) from error


# 查询某场面试的会话详情.
@router.get("/interviews/{interview_id}", response_model=InterviewItem)
def get_interview_detail(interview_id: str, db: Session = Depends(get_db)):
    try:
        return get_interview_detail_service(interview_id, db)
    except InterviewNotFoundError as error:
        raise HTTPException(status_code=404, detail="面试会话不存在!") from error
    except Exception as error:
        raise HTTPException(
            status_code=500, detail="查看面试详情失败,请重试!"
        ) from error


# 查询某场面试的对话记录.
@router.get(
    "/interviews/{interview_id}/messages", response_model=list[InterviewMessageItem]
)
def get_interview_message(interview_id: str, db: Session = Depends(get_db)):
    try:
        return get_interview_message_service(interview_id, db)
    except InterviewNotFoundError as error:
        raise HTTPException(status_code=404, detail="面试会话不存在!") from error
    except Exception as error:
        raise HTTPException(
            status_code=500, detail="查看面试详情失败,请重试!"
        ) from error


# 创建面试会话.
@router.post("/interviews", response_model=CreateInterviewResponse)
def create_interview(data: CreateInterviewRequest, db: Session = Depends(get_db)):
    try:
        return create_interview_service(data, db)
    except OpenAIInvokeError as error:
        raise HTTPException(
            status_code=502, detail="AI服务暂时不可用,请稍后重试!"
        ) from error

    except Exception as error:
        raise HTTPException(status_code=500, detail="创建面试失败,请重试!") from error


# 多轮对话.
@router.post("/interviews/{interview_id}/messages", response_model=SubmitAnswerResponse)
def submit_answer(
    interview_id: str, data: SubmitAnswerRequest, db: Session = Depends(get_db)
):
    try:
        return submit_answer_service(interview_id, data, db)

    except InterviewNotFoundError as error:
        raise HTTPException(status_code=404, detail="面试会话不存在!") from error

    except OpenAIInvokeError as error:
        raise HTTPException(
            status_code=502, detail="AI服务暂时不可用,请稍后重试!"
        ) from error

    except Exception as error:
        raise HTTPException(status_code=500, detail="提交回答失败,请重试!") from error


# 面试反馈与总结.
@router.post(
    "/interviews/{interview_id}/finish", response_model=FinishInterviewResponse
)
def finish_interview(
    interview_id: str,
    data: FinishInterviewRequest = Body(default_factory=FinishInterviewRequest),
    db: Session = Depends(get_db),
):
    try:
        return finish_interview_service(interview_id, data, db)

    except InterviewNotFoundError as error:
        raise HTTPException(status_code=404, detail="面试会话不存在!") from error

    except OpenAIInvokeError as error:
        raise HTTPException(
            status_code=502, detail="AI服务暂时不可用,请稍后重试!"
        ) from error

    except (JSONDecodeError, ValueError, ValidationError) as error:
        raise HTTPException(
            status_code=502, detail="模型返回的结果格式不正确,请重试!"
        ) from error

    except Exception as error:
        raise HTTPException(
            status_code=500, detail="生成面试结果失败,请重试!"
        ) from error


# 查询某场面试的结果报告.
@router.get("/interviews/{interview_id}/report", response_model=FinishInterviewResponse)
def get_interview_report(interview_id: str, db: Session = Depends(get_db)):
    try:
        return get_interview_report_service(interview_id, db)
    except InterviewNotFoundError as error:
        raise HTTPException(status_code=404, detail="面试会话不存在!") from error
    except InterviewReportNotFoundError as error:
        raise HTTPException(status_code=404, detail="面试报告不存在!") from error
    except Exception as error:
        raise HTTPException(
            status_code=500, detail="查询面试结果失败,请重试!"
        ) from error
