from uuid import uuid4
from app.schemas.interviews import (
    CreateInterviewRequest,
    CreateInterviewResponse,
    InterviewItem,
    SubmitAnswerRequest,
    SubmitAnswerResponse,
    FinishInterviewRequest,
    FinishInterviewResponse,
    InterviewMessageHistory,
)
from app.prompts.interviews import (
    build_first_question_prompt,
    build_follow_up_question_prompt,
    build_finish_interview_prompt,
)
from app.utils.format_json import parse_json_from_text
from app.client.openai_client import invoke
from app.errors.interviews import InterviewNotFoundError
from sqlalchemy.orm import Session
from sqlalchemy import select
from datetime import datetime
from app.models.interview import Interview
from app.models.interview_message import InterviewMessage
from app.models.interview_report import InterviewReport


def create_interview_service(
    data: CreateInterviewRequest, db: Session
) -> CreateInterviewResponse:
    # 用uuid生成一个随机id,作为本场面试的interview_id
    interview_id = str(uuid4())
    response = invoke(build_first_question_prompt(data))

    now = datetime.now()

    interview = Interview(
        id=interview_id,
        target_role=data.target_role,
        tech_stack=",".join(data.tech_stack),
        experience_years=data.experience_years,
        difficulty=data.difficulty.value,
        status="in_progress",
        current_round=1,
        created_at=now,
        updated_at=now,
    )

    message = InterviewMessage(
        interview_id=interview_id,
        role="assistant",
        content=response,
        round=1,
        created_at=now,
    )

    db.add_all([interview, message])
    db.commit()

    # 返回的数据会被fastapi自动转成JSON.
    return CreateInterviewResponse(interview_id=interview_id, first_question=response)


# 多轮会话.
def submit_answer_service(
    interview_id: str, data: SubmitAnswerRequest, db: Session
) -> SubmitAnswerResponse:
    now = datetime.now()

    interview = db.get(Interview, interview_id)

    if not interview:
        raise InterviewNotFoundError("面试会话不存在!")

    # 助手最后一条回复.
    last_question_message = (
        db.execute(
            select(InterviewMessage)
            .where(
                InterviewMessage.interview_id == interview_id,
                InterviewMessage.role == "assistant",
            )
            .order_by(InterviewMessage.id.desc())
        )
        .scalars()
        .first()
    )

    if not last_question_message:
        raise InterviewNotFoundError("上一条的面试问题不存在!")

    last_question = last_question_message.content
    current_round = interview.current_round

    user_message = InterviewMessage(
        interview_id=interview_id,
        role="user",
        content=data.answer,
        round=current_round,
        created_at=now,
    )
    db.add(user_message)

    if current_round >= 3:
        interview.status = "finished"
        interview.updated_at = now

        db.commit()

        return SubmitAnswerResponse(
            interview_id=interview_id,
            next_question="",
            round=current_round,
            is_finished=True,
        )

    response = invoke(
        build_follow_up_question_prompt(last_question, data.answer, current_round)
    )

    next_round = current_round + 1
    assistant_message = InterviewMessage(
        interview_id=interview_id,
        role="assistant",
        content=response,
        round=next_round,
        created_at=now,
    )

    interview.current_round = next_round
    interview.updated_at = now
    db.add(assistant_message)
    db.commit()

    return SubmitAnswerResponse(
        interview_id=interview_id,
        next_question=response,
        round=next_round,
        is_finished=False,
    )


# 面试反馈与总结.
def finish_interview_service(
    interview_id: str, data: FinishInterviewRequest, db: Session
) -> FinishInterviewResponse:
    interview = db.get(Interview, interview_id)

    if not interview:
        raise InterviewNotFoundError("面试会话不存在!")

    # 如果结果表中存在当前面试会话id的总结,直接使用.
    existing_report = db.execute(
        select(InterviewReport).where(InterviewReport.interview_id == interview_id)
    ).scalar_one_or_none()

    if existing_report:
        return FinishInterviewResponse(
            interview_id=interview_id,
            score=existing_report.score,
            strengths=existing_report.strengths.split(";"),
            weaknesses=existing_report.weaknesses.split(";"),
            suggestions=existing_report.suggestions.split(";"),
        )

    messages = (
        db.execute(
            select(InterviewMessage)
            .where(InterviewMessage.interview_id == interview_id)
            .order_by(InterviewMessage.id.asc())
        )
        .scalars()
        .all()
    )

    if not messages:
        raise InterviewNotFoundError("面试消息为空!")

    finish_data = FinishInterviewRequest(
        messages=[
            InterviewMessageHistory(role=message.role, content=message.content)
            for message in messages
        ]
    )

    response = invoke(build_finish_interview_prompt(finish_data))
    result = parse_json_from_text(response)

    result["interview_id"] = interview_id

    response_data = FinishInterviewResponse(**result)

    report = InterviewReport(
        interview_id=interview_id,
        score=response_data.score,
        strengths=";".join(response_data.strengths),
        weaknesses=";".join(response_data.weaknesses),
        suggestions=";".join(response_data.suggestions),
        created_at=datetime.now(),
    )

    interview.status = "reported"
    interview.updated_at = datetime.now()

    db.add(report)
    db.commit()

    return response_data


# 历史记录.
def list_interviews_service(db: Session) -> list[InterviewItem]:
    interviews = (
        db.execute(select(Interview).order_by(Interview.created_at.desc()))
        .scalars()
        .all()
    )

    return [InterviewItem.model_validate(interview) for interview in interviews]
