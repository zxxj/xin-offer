
from uuid import uuid4
from app.schemas.interviews import CreateInterviewRequest, CreateInterviewResponse


def create_interview_service(data: CreateInterviewRequest) -> CreateInterviewResponse:
    # 用uuid生成一个随机id,作为本场面试的interview_id
    interview_id = str(uuid4())

    # 根据用户输入的信息拼接出第一个面试问题.
    first_question = (
        f"你正在面试{data.target_role}岗位."
        f"请结合你的{', '.join(data.tech_stack)}技术经验,"
        f"介绍一个你做过的最有代表性的项目."
    )

    # 返回的数据会被fastapi自动转成JSON.
    return CreateInterviewResponse(interview_id=interview_id, first_question=first_question)