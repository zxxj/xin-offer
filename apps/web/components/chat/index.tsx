"use client";

import { useState } from "react";

import InputBox from "./input-box";
import MessageList, { type Message } from "./message-list";
import { chat } from "@/services/chat";

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "你好！我是你的 AI 面试官，准备好了就开始吧。",
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    const content = input.trim();
    if (!content || sending) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
    };

    setInput("");
    setMessages((prev) => [...prev, userMessage]);

    try {
      setSending(true);
      const { reply } = await chat({ message: content });

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: reply,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.log(error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-screen w-screen flex-col bg-background">
      <MessageList messages={messages} />
      <InputBox
        value={input}
        onChange={setInput}
        onSend={handleSend}
        disabled={sending}
      />
    </div>
  );
};

export default Chat;
