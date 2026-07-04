"use client";

import { useState } from "react";

import InputBox from "./input-box";
import MessageList, { type Message } from "./message-list";
import StartInterviewDialog, {
  type StartInterviewPayload,
} from "./start-interview-dialog";
import { chat } from "@/services/chat";
import { createInterview, interview } from "@/services/interview";
import { DIFFICULTY_OPTIONS } from "@/lib/const";
import InterviewResultDialog from "./interview-result-dialog";

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      type: "text",
      role: "assistant",
      content:
        "你好，我是 xin-offer 面试助手。你可以问我求职、简历、面试准备问题，也可以点击“开始面试”进行模拟面试。",
    },
    {
      id: "start_interview_button",
      type: "start_interview_button",
      role: "assistant",
      content: "",
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [startDialogOpen, setStartDialogOpen] = useState(false);
  const [finishDialogOpen, setFinishDialogOpen] = useState(false);
  const [currentInterviewRoomID, setCurrentInterviewRoomID] = useState<
    string | null
  >(null);
  const [round, setRound] = useState<number>(1);
  const [interviewFinishId, setInterviewFinishId] = useState<string>("");

  const handleSend = async () => {
    const content = input.trim();
    if (!content || sending) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      type: "text",
      role: "user",
      content,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      setSending(true);
      // 面试会话.
      if (currentInterviewRoomID) {
        const {
          next_question,
          round: resultRound,
          is_finished,
        } = await interview({
          interview_id: currentInterviewRoomID,
          question: [...messages]
            .reverse()
            .find(
              (m) =>
                m.role === "assistant" && m.type === "text" && m.content.trim(),
            )?.content as string,
          answer: userMessage.content,
          round,
        });

        let assistantMessage: Message = {
          id: "",
          type: "text",
          role: "assistant",
          content: "",
        };

        if (is_finished) {
          assistantMessage = {
            id: crypto.randomUUID(),
            type: "interview_finish",
            role: "assistant",
            content: "面试已结束,点击下方按钮生成面试反馈报告.",
            interviewId: currentInterviewRoomID,
          };
          setMessages((prev) => [...prev, assistantMessage]);
          setCurrentInterviewRoomID(null);
        } else {
          assistantMessage = {
            id: crypto.randomUUID(),
            type: "text",
            role: "assistant",
            content: next_question,
          };
          setMessages((prev) => [...prev, assistantMessage]);
        }

        setRound(resultRound);
      } else {
        // 闲聊.
        const { reply } = await chat({ message: content });

        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          type: "text",
          role: "assistant",
          content: reply,
        };

        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setSending(false);
    }
  };

  const handleStartInterviewButton = () => {
    setStartDialogOpen(true);
  };

  const handleViewInterviewResultButton = (interviewId: string) => {
    setInterviewFinishId(interviewId);
    setFinishDialogOpen(true);
  };

  const handleStartInterviewConfirm = async (data: StartInterviewPayload) => {
    setStartDialogOpen(false);
    try {
      const userMessage: Message = {
        id: crypto.randomUUID(),
        type: "text",
        role: "user",
        content: `我要面试${data.target_role}的${DIFFICULTY_OPTIONS.find((d) => d.value === data.difficulty)?.label}岗位,我已有${data.experience_years}年工作经验,技术栈是${data.tech_stack.join(",")}`,
      };

      setMessages((prev) => [...prev, userMessage]);
      const { first_question, interview_id } = await createInterview(data);
      setCurrentInterviewRoomID(interview_id);
      setInterviewFinishId(interview_id);

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        type: "text",
        content: first_question,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex h-screen w-screen flex-col bg-background">
      <MessageList
        messages={messages}
        handleStartInterviewButton={handleStartInterviewButton}
        handleViewInterviewResultButton={handleViewInterviewResultButton}
      />
      <InputBox
        value={input}
        onChange={setInput}
        onSend={handleSend}
        disabled={sending}
      />
      <StartInterviewDialog
        open={startDialogOpen}
        onOpenChange={setStartDialogOpen}
        onConfirm={handleStartInterviewConfirm}
      />

      <InterviewResultDialog
        open={finishDialogOpen}
        onOpenChange={setFinishDialogOpen}
        interviewId={interviewFinishId}
        messages={messages
          .filter((m) => m.type === "text" && m.id !== "welcome")
          .map(({ role, content }) => ({ role, content }))}
      />
    </div>
  );
};

export default Chat;
