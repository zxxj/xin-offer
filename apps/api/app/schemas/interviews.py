# 面试相关.

from enum import Enum
from pydantic import BaseModel, Field


# 定义面试难度的可选值,继承str是为了让枚举值在JSON中表现为字符串.
class Difficulty(str, Enum):
    junior = "junior"
    middle = "middle"
    senior = "senior"

# 创建面试的请求体.
class CreateInterviewRequest(BaseModel):
    # 目标岗位不能为空.
    target_role: str = Field(min_length=1)
    #技术栈至少要有一项.
    tech_stack: list[str] = Field(min_length=1)
    #工作年限必须在0~30之间.
    experience_years: int = Field(ge=0, le=30)
    #面试难度范围.
    difficulty: Difficulty

# 创建面试的响应体.
class CreateInterviewResponse(BaseModel):
    interview_id: str
    first_question: str

# 用户追问时的请求体.
class SubmitAnswerRequest(BaseModel):
    # 用户的回答.
    answer: str = Field(min_length=1)

# 追问的返回体.
class SubmitAnswerResponse(BaseModel):
    interview_id: str
    # 下一轮的问题.
    next_question: str
    # 下一轮的轮次.
    round: int
    # 面试是否结束.
    is_finished: bool 

# 面试最终反馈.
# 历史消息列表.
class InterviewMessageHistory(BaseModel):
    role: str = Field(min_length=1)
    content: str = Field(min_length=1)

# 面试反馈请求体.
class FinishInterviewRequest(BaseModel):
    # 消息列表.
    messages: list[InterviewMessageHistory] = Field(default_factory=list)

# 面试反馈返回体.
class FinishInterviewResponse(BaseModel):
    # 面试id.
    interview_id: str
    # 成绩.
    score: int = Field(ge=0, le=100)
    # 优点.
    strengths: list[str]
    # 不足.
    weaknesses: list[str]
    # 学习建议.
    suggestions: list[str]
