type CreateInterviewRequest = {
  target_role: string;
  tech_stack: string[];
  experience_years: number;
  difficulty: string;
};

type InterviewMessage = {
  interview_id: string;
  question: string;
  answer: string;
  round: number;
};

export const createInterview = async (data: CreateInterviewRequest) => {
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

export const interview = async (data: InterviewMessage) => {
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

export type FinishInterviewResponse = {
  interview_id: string;
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
};

export type FinishInterviewMessage = {
  role: string;
  content: string;
};

export const finishInterview = async (
  interviewId: string,
  messages: FinishInterviewMessage[],
): Promise<FinishInterviewResponse> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/interviews/${interviewId}/finish`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages }),
    },
  );

  if (!res.ok) {
    throw new Error("接口失败!");
  }

  return res.json();
};
