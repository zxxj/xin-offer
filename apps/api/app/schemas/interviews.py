# 定义面试难度的可选值,继承str是为了让枚举值在JSON中表现为字符串.
from enum import Enum

from pydantic import BaseModel, Field


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