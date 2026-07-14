// 消息hook.

import type { Message } from "@/components/chat/types";
import {
  createAssistantInterviewFinishedMessage,
  createAssistantTextMessage,
  createUserTextMessage,
} from "@/lib/chat";
import { INITIAL_MESSAGES } from "@/lib/const";
import { useCallback, useState } from "react";

export const useChatMessages = () => {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);

  const addUserMessage = useCallback((content: string) => {
    setMessages((prev) => [...prev, createUserTextMessage(content)]);
  }, []);

  const addAssistantMessage = useCallback((content: string) => {
    setMessages((prev) => [...prev, createAssistantTextMessage(content)]);
  }, []);

  const addAssistantFinishMessage = useCallback(
    (
      content: string,
      interviewId: string,
      resultMode: "generate" | "view" = "generate",
    ) => {
      setMessages((prev) => [
        ...prev,
        createAssistantInterviewFinishedMessage(
          content,
          interviewId,
          resultMode,
        ),
      ]);
    },
    [],
  );

  const addAssistantErrorMessage = useCallback(
    (content: string = "抱歉,请求失败,请稍后重试.") => {
      setMessages((prev) => [...prev, createAssistantTextMessage(content)]);
    },
    [],
  );

  // 加载历史会话消息(替换当前列表).
  const loadMessages = useCallback((history: Message[]) => {
    setMessages(history);
  }, []);

  // 恢复到初始闲聊状态,用于开始一场新的面试.
  const resetMessages = useCallback(() => {
    setMessages(INITIAL_MESSAGES);
  }, []);

  const startAssistantStreamMessage = useCallback(() => {
    const message = createAssistantTextMessage("");

    setMessages((prev) => [...prev, message]);

    return message.id;
  }, []);

  const appendAssistantStreamDelta = useCallback(
    (messageId: string, delta: string) => {
      setMessages((prev) =>
        prev.map((m) => {
          if (
            m.id !== messageId ||
            m.type !== "text" ||
            m.role !== "assistant"
          ) {
            return m;
          } else {
            return { ...m, content: `${m.content}${delta}` };
          }
        }),
      );
    },
    [],
  );

  return {
    messages,
    addUserMessage,
    addAssistantMessage,
    addAssistantFinishMessage,
    addAssistantErrorMessage,
    loadMessages,
    resetMessages,
    startAssistantStreamMessage,
    appendAssistantStreamDelta,
  };
};
