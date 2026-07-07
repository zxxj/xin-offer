from uuid import uuid4
from app.schemas.interviews import CreateInterviewRequest, CreateInterviewResponse, SubmitAnswerRequest, SubmitAnswerResponse, FinishInterviewRequest, FinishInterviewResponse, InterviewMessageHistory
from app.prompts.interviews import build_first_question_prompt, build_follow_up_question_prompt, build_finish_interview_prompt
from app.utils.format_json import parse_json_from_text
from app.client.openai_client import invoke
from app.stores.interview_store import InterviewSession, get_interview_session, save_interview_session, InterviewSessionNotFoundError


def create_interview_service(data: CreateInterviewRequest) -> CreateInterviewResponse:
    # 用uuid生成一个随机id,作为本场面试的interview_id
    interview_id = str(uuid4())
    response = invoke(build_first_question_prompt(data))

    session = InterviewSession(
        interview_id=interview_id,
        config=data,
        round=1,
        messages=[InterviewMessageHistory(
            role="assistant",
            content=response
        )]
    )

    save_interview_session(session)

    # 返回的数据会被fastapi自动转成JSON.
    return CreateInterviewResponse(interview_id=interview_id, first_question=response)

# 多轮会话.
def submit_answer_service(interview_id: str, data: SubmitAnswerRequest) -> SubmitAnswerResponse:
    session = get_interview_session(interview_id)

    if not session:
        raise InterviewSessionNotFoundError("面试会话不存在!")
    
    # 助手最后一条回复.
    last_question = session.messages[-1].content
    
    session.messages.append(InterviewMessageHistory(role='user', content=data.answer))

    if session.round >= 3:
        save_interview_session(session)
        return SubmitAnswerResponse(
          interview_id=interview_id,
          next_question="",
          round=session.round,
          is_finished=True,
       )
    
    response = invoke(build_follow_up_question_prompt(last_question, data.answer, session.round))

    session.messages.append(InterviewMessageHistory(role='assistant', content=response))
    session.round = session.round + 1
    save_interview_session(session)

    return SubmitAnswerResponse(
        interview_id=interview_id,
        next_question=response,
        round=session.round,
        is_finished=False
  )

# 面试反馈与总结.
def finish_interview_service(interview_id: str, data: FinishInterviewRequest) -> FinishInterviewResponse:
    session = get_interview_session(interview_id)

    if not session:
        raise InterviewSessionNotFoundError("面试会话不存在!")
    
    finish_data = FinishInterviewRequest(messages=session.messages)

    response = invoke(build_finish_interview_prompt(finish_data))
    result = parse_json_from_text(response)

    result["interview_id"] = interview_id

    return FinishInterviewResponse(**result)