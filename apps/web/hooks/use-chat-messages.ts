// 消息hook.

import type { Message } from "@/components/chat/types";
import {
  createAssistantInterviewFinishedMessage,
  createAssistantTextMessage,
  createUserTextMessage,
} from "@/lib/chat";
import { INITIAL_MESSAGES } from "@/lib/const";
import { useState } from "react";

export const useChatMessages = () => {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);

  const addUserMessage = (content: string) => {
    setMessages((prev) => [...prev, createUserTextMessage(content)]);
  };

  const addAssistantMessage = (content: string) => {
    setMessages((prev) => [...prev, createAssistantTextMessage(content)]);
  };

  const addAssistantFinishMessage = (content: string, interviewId: string) => {
    setMessages((prev) => [
      ...prev,
      createAssistantInterviewFinishedMessage(content, interviewId),
    ]);
  };

  const addAssistantErrorMessage = (
    content: string = "抱歉,请求失败,请稍后重试.",
  ) => {
    setMessages((prev) => [...prev, createAssistantTextMessage(content)]);
  };

  return {
    messages,
    addUserMessage,
    addAssistantMessage,
    addAssistantFinishMessage,
    addAssistantErrorMessage,
  };
};
