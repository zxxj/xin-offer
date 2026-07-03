from uuid import uuid4
from openai import OpenAI
from app.schemas.interviews import CreateInterviewRequest, CreateInterviewResponse, SubmitAnswerRequest, SubmitAnswerResponse, FinishInterviewRequest, FinishInterviewResponse
from app.core.config import settings
from app.prompts.interviews import build_first_question_prompt, build_follow_up_question_prompt, build_finish_interview_prompt
import json

client = OpenAI(api_key=settings.openai_api_key, base_url=settings.openai_base_url)


def create_interview_service(data: CreateInterviewRequest) -> CreateInterviewResponse:
    # 用uuid生成一个随机id,作为本场面试的interview_id
    interview_id = str(uuid4())

    response = client.responses.create(
        model=settings.openai_model_name,
        input=build_first_question_prompt(data),
    )

    first_question = response.output_text

    # 返回的数据会被fastapi自动转成JSON.
    return CreateInterviewResponse(interview_id=interview_id, first_question=first_question)

# 多轮会话.
def submit_answer_service(interview_id: str, data: SubmitAnswerRequest) -> SubmitAnswerResponse:
    if data.round >= 3:
       return SubmitAnswerResponse(
          interview_id=interview_id,
          next_question="",
          round=data.round,
          is_finished=True,
       )
    
    response = client.responses.create(
        model=settings.openai_model_name,
        input=build_follow_up_question_prompt(data)
  )

    next_round = data.round + 1

    return SubmitAnswerResponse(
        interview_id=interview_id,
        next_question=response.output_text,
        round=next_round,
        is_finished=False
  )

# 面试反馈与总结.
def finish_interview_service(interview_id: str, data: FinishInterviewRequest) -> FinishInterviewResponse:
    response = client.responses.create(
        model=settings.openai_model_name,
        input=build_finish_interview_prompt(data)
    )

    result = json.loads(response.output_text)

    return FinishInterviewResponse(
        interview_id=interview_id,
        score=result["score"],
        strengths=result["strengths"],
        weaknesses=result["weaknesses"],
        suggestions=result["suggestions"]
    )