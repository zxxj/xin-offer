from pydantic import BaseModel, Field

from app.schemas.interviews import CreateInterviewRequest, InterviewMessageHistory

class InterviewSessionNotFoundError(Exception):
  pass

class InterviewSession(BaseModel):
  interview_id: str
  config: CreateInterviewRequest
  round: int = 1
  messages: list[InterviewMessageHistory] = Field(default_factory=list)

interview_sessions: dict[str, InterviewSession] = {}
 
# 插入数据.
def save_interview_session(session: InterviewSession) -> None:
  interview_sessions[session.interview_id] = session

# 根据面试id查询数据.
def get_interview_session(interview_id: str) -> InterviewSession | None:
  return interview_sessions.get(interview_id)

# 删除数据.
def delete_interview_session(interview_id: str) -> None:
  interview_sessions.pop(interview_id, None)