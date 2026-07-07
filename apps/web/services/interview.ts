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
