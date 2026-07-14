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

// 流式.
type ChatStreamRequest = {
  message: string;
  onDelta: (delta: string) => void;
};

type ChatStreamPayload = {
  delta?: string;
  message?: string;
};

// 请求聊天接口,每收到一段文本就执行onDelta.
export const chatStream = async ({
  message,
  onDelta,
}: ChatStreamRequest): Promise<void> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/chat/stream`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    },
  );

  if (!res.ok) {
    throw new Error("流式对话请求失败!");
  }

  if (!res.body) {
    throw new Error("浏览器不支持流式读取响应!");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      const events = buffer.split("\n\n");
      buffer = events.pop() ?? "";

      for (const event of events) {
        const eventType = event.match(/^event:\s*(.+)$/m)?.[1];
        const dataText = event.match(/^data:\s*(.+)$/m)?.[1];

        if (!eventType || !dataText) continue;

        const payload: ChatStreamPayload = JSON.parse(dataText);

        if (eventType === "error") {
          throw new Error(payload.message ?? "流式对话失败!");
        }

        if (eventType === "message" && payload.delta) {
          onDelta(payload.delta);
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
};
