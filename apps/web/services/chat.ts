type ChatRequest = {
  message: string;
};

type ChatResponse = {
  reply: string;
};

export const chat = async (data: ChatRequest): Promise<ChatResponse> => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("对话请求接口失败!");
  }

  return res.json();
};
