import type {
  InterviewFinishMessage,
  InterviewResultMode,
  TextMessage,
} from "@/components/chat/types";

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
  resultMode: InterviewResultMode = "generate",
): InterviewFinishMessage => {
  return {
    id: crypto.randomUUID(),
    type: "interview_finish",
    role: "assistant",
    content,
    interviewId,
    resultMode,
  };
};
