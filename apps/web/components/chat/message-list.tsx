"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type MessageListProps = {
  messages: Message[];
  className?: string;
};

const MessageList = ({ messages, className }: MessageListProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      ref={scrollRef}
      className={cn(
        "flex-1 overflow-y-auto px-4 py-6 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:bg-transparent",
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
        {messages.length === 0 ? (
          <div className="flex flex-1 items-center justify-center py-24 text-sm text-muted-foreground">
            暂无对话，开始聊聊吧
          </div>
        ) : (
          messages.map((m) => {
            const isUser = m.role === "user";
            return (
              <div
                key={m.id}
                className={cn(
                  "flex w-full",
                  isUser ? "justify-end" : "justify-start",
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed break-words whitespace-pre-wrap",
                    isUser
                      ? "rounded-tr-md bg-primary text-primary-foreground"
                      : "rounded-tl-md bg-muted text-foreground",
                  )}
                >
                  {m.content}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MessageList;
