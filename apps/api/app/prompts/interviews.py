from app.schemas.interviews import CreateInterviewRequest, SubmitAnswerRequest, FinishInterviewRequest

# 创建面试.
def build_first_question_prompt(data: CreateInterviewRequest) -> str:
  return f"""
你是一个严格但友好的技术面试官.
请根据下面候选人的信息,生成一个适合作为开场的技术面试问题.

候选人信息:
- 目标岗位: {data.target_role}
- 技术栈: {", ".join(data.tech_stack)}
- 工作年限: {data.experience_years}年
- 面试难度: {data.difficulty.value}

要求:
1. 只输出一个问题.
2. 问题要具体,不要问"请做一下自我介绍".
3. 问题应该能引导候选人讲项目经验.
4. 使用中文.
""".strip()

# 多轮会话.
def build_follow_up_question_prompt(data: SubmitAnswerRequest) -> str:
  return f"""
你是一个严格但友好的面试官.
下面是候选人的上一轮面试内容:

面试官问题: 
{data.question}

候选人回答:
{data.answer}

当前轮次: 第{data.round} 轮.

请根据候选人的回答,生成一个有针对性的追问.

要求:
1. 只输出一个追问问题.
2. 不要重复上一轮问题.
3. 追问要基于候选人的回答细节.
4. 如果候选人的回答很空泛,请追问具体项目,技术细节或个人贡献.
5. 使用中文.
""".strip()

# 面试反馈与总结.
def build_finish_interview_prompt(data: FinishInterviewRequest) -> str:
  messages_text = "\n".join(f"{message.role}:{message.content}" for message in data.messages)

  return f"""
你是一个专业的技术面试官.

下面是一场模拟面试的完整问答记录:

{messages_text}

请根据候选人的回答质量,生成一份结构化的面试反馈.

要求:
1. score是0-100的整数.
2. strengths列出2到4条优点.
3. weaknesses列出2-4条不足.
4. suggestions列出2-4条后续学习建议.
5. 必须使用JSON格式输出.
6. 不要输出JSON之外的任何内容.
6. 使用中文回答.

输出格式:
{{
  "score": 100,
  "strengths": ["优点1","优点2"],
  "weaknesses": ["不足1","不足2"],
  "suggestions": ["建议1","建议2"]
}}
""".strip()