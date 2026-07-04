"use client";

import { useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type Message =
  | {
      id: string;
      type: "text";
      role: "user" | "assistant";
      content: string;
    }
  | {
      id: string;
      role: "assistant";
      type: "start_interview_button";
      content: string;
    }
  | {
      id: string;
      role: "assistant";
      type: "interview_finish";
      content: string;
      interviewId: string;
    };

type MessageListProps = {
  messages: Message[];
  className?: string;
  handleStartInterviewButton: () => void;
  handleViewInterviewResultButton: (interviewId: string) => void;
};

const MessageList = ({
  messages,
  className,
  handleStartInterviewButton,
  handleViewInterviewResultButton,
}: MessageListProps) => {
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
            if (m.role === "assistant" && m.type === "start_interview_button") {
              return (
                <div key={m.id} className="flex w-full justify-start">
                  <Button
                    onClick={handleStartInterviewButton}
                    variant="default"
                    size="sm"
                    className="group rounded-full px-4 shadow-sm transition-all duration-200 hover:shadow-md active:scale-[0.98]"
                  >
                    开始面试
                    <ArrowRight className="ml-1.5 size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </Button>
                </div>
              );
            }

            if (m.role === "assistant" && m.type === "interview_finish") {
              return (
                <div key={m.id} className="flex w-full justify-start">
                  <Button
                    onClick={() =>
                      handleViewInterviewResultButton(m.interviewId)
                    }
                    variant="default"
                    size="sm"
                    className="group rounded-full px-4 shadow-sm transition-all duration-200 hover:shadow-md active:scale-[0.98]"
                  >
                    查看面试结果
                    <ArrowRight className="ml-1.5 size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </Button>
                </div>
              );
            }
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
