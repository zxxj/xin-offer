type CreateInterviewRequest = {
  target_role: string;
  tech_stack: string[];
  experience_years: number;
  difficulty: string;
};

type CreateInterviewResponse = {
  interview_id: string;
  first_question: string;
};

type InterviewMessage = {
  interview_id: string;
  answer: string;
};

type InterviewMessageResponse = {
  interview_id: string;
  next_question: string;
  round: number;
  is_finished: boolean;
};

export type FinishInterviewResponse = {
  interview_id: string;
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
};

export type InterviewHistoryItem = {
  id: string;
  target_role: string;
  tech_stack: string;
  experience_years: number;
  difficulty: string;
  status: string;
  current_round: number;
  created_at: string;
  updated_at: string;
};

export type InterviewMessageItem = {
  id: number;
  interview_id: string;
  role: string;
  content: string;
  round: number;
  created_at: string;
};

// 创建面试会话.
export const createInterview = async (
  data: CreateInterviewRequest,
): Promise<CreateInterviewResponse> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/interviews`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    },
  );

  if (!res.ok) {
    throw new Error("接口失败!");
  }

  return res.json();
};

// 多轮会话.
export const interview = async (
  data: InterviewMessage,
): Promise<InterviewMessageResponse> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/interviews/${data.interview_id}/messages`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    },
  );

  if (!res.ok) {
    throw new Error("接口失败!");
  }

  return res.json();
};

// 获取面试结果报告.
export const finishInterview = async (
  interviewId: string,
): Promise<FinishInterviewResponse> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/interviews/${interviewId}/finish`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    },
  );

  if (!res.ok) {
    throw new Error("接口失败!");
  }

  return res.json();
};

// 查询历史面试列表.
export const getInterviews = async (): Promise<InterviewHistoryItem[]> => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/interviews`);

  if (!res.ok) {
    throw new Error("查询面试历史记录接口失败!");
  }

  return res.json();
};

// 查询某场面试的对话记录.
export const getInterviewMessages = async (
  interviewId: string,
): Promise<InterviewMessageItem[]> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/interviews/${interviewId}/messages`,
  );

  if (!res.ok) {
    throw new Error("查询面试对话记录失败!");
  }

  return res.json();
};

// 查询某场面试已生成的结果报告.
export const getInterviewReport = async (
  interviewId: string,
): Promise<FinishInterviewResponse> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/interviews/${interviewId}/report`,
  );

  if (!res.ok) {
    throw new Error("查询面试结果报告失败!");
  }

  return res.json();
};
