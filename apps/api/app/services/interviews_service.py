from uuid import uuid4
from app.schemas.interviews import CreateInterviewRequest, CreateInterviewResponse, SubmitAnswerRequest, SubmitAnswerResponse, FinishInterviewRequest, FinishInterviewResponse
from app.prompts.interviews import build_first_question_prompt, build_follow_up_question_prompt, build_finish_interview_prompt
from app.utils.format_json import parse_json_from_text
from app.client.openai_client import invoke


def create_interview_service(data: CreateInterviewRequest) -> CreateInterviewResponse:
    # 用uuid生成一个随机id,作为本场面试的interview_id
    interview_id = str(uuid4())
    response = invoke(build_first_question_prompt(data))

    # 返回的数据会被fastapi自动转成JSON.
    return CreateInterviewResponse(interview_id=interview_id, first_question=response)

# 多轮会话.
def submit_answer_service(interview_id: str, data: SubmitAnswerRequest) -> SubmitAnswerResponse:
    if data.round >= 3:
       return SubmitAnswerResponse(
          interview_id=interview_id,
          next_question="",
          round=data.round,
          is_finished=True,
       )
    
    response = invoke(build_follow_up_question_prompt(data))

    next_round = data.round + 1

    return SubmitAnswerResponse(
        interview_id=interview_id,
        next_question=response,
        round=next_round,
        is_finished=False
  )

# 面试反馈与总结.
def finish_interview_service(interview_id: str, data: FinishInterviewRequest) -> FinishInterviewResponse:
    response = invoke(build_finish_interview_prompt(data))
    result = parse_json_from_text(response)

    result["interview_id"] = interview_id

    return FinishInterviewResponse(**result)

    # return FinishInterviewResponse(
    #     interview_id=interview_id,
    #     score=result["score"],
    #     strengths=result["strengths"],
    #     weaknesses=result["weaknesses"],
    #     suggestions=result["suggestions"]
    # )