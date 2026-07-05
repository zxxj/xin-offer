import type {
  InterviewFinishMessage,
  Message,
  TextMessage,
} from "@/components/chat/types";

// 找到上一轮的AI问题.
export const getLastAssistantQuestion = (messages: Message[]) => {
  return [...messages]
    .reverse()
    .find(
      (m) => m.role === "assistant" && m.type === "text" && m.content.trim(),
    )?.content as string;
};

// 创建用户消息.
export const createUserTextMessage = (content: string): TextMessage => {
  return {
    id: crypto.randomUUID(),
    type: "text",
    role: "user",
    content,
  };
};

// 创建助手消息.
export const createAssistantTextMessage = (content: string): TextMessage => {
  return {
    id: crypto.randomUUID(),
    type: "text",
    role: "assistant",
    content,
  };
};

// 助手消息,渲染面试结果按钮.
export const createAssistantInterviewFinishedMessage = (
  content: string,
  interviewId: string,
): InterviewFinishMessage => {
  return {
    id: crypto.randomUUID(),
    type: "interview_finish",
    role: "assistant",
    content,
    interviewId,
  };
};
