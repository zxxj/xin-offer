type CreateInterviewRequest = {
  target_role: string | null;
  tech_stack: string[] | null;
  experience_years: string | null;
  difficulty: string | null;
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
  return res.json();
};
