"use client";

import { useState } from "react";
import InputBox from "./input-box";
import MessageList from "./message-list";
import StartInterviewDialog, {
  type StartInterviewPayload,
} from "./start-interview-dialog";
import { chat } from "@/services/chat";
import { createInterview, interview } from "@/services/interview";
import { DIFFICULTY_OPTIONS } from "@/lib/const";
import InterviewResultDialog from "./interview-result-dialog";
import { getLastAssistantQuestion } from "@/lib/chat";
import { useChatMessages } from "@/hooks/use-chat-messages";
import { useInterviewSession } from "@/hooks/use-interview-session";

const Chat = () => {
  const {
    messages,
    addUserMessage,
    addAssistantMessage,
    addAssistantFinishMessage,
  } = useChatMessages();

  const {
    activeInterviewId,
    activeInterviewRound,
    setActiveInterviewRound,
    interviewFinishId,
    startInterview,
    finishInterview,
    openInterviewResult,
  } = useInterviewSession();

  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [startDialogOpen, setStartDialogOpen] = useState(false);
  const [finishDialogOpen, setFinishDialogOpen] = useState(false);

  const handleSend = async () => {
    const content = input.trim();
    if (!content || sending) return;

    addUserMessage(content);
    setInput("");

    try {
      setSending(true);
      // 面试会话.
      if (activeInterviewId) {
        const {
          next_question,
          round: resultRound,
          is_finished,
        } = await interview({
          interview_id: activeInterviewId,
          question: getLastAssistantQuestion(messages),
          answer: content,
          round: activeInterviewRound,
        });

        if (is_finished) {
          addAssistantFinishMessage(
            "面试已结束,点击下方按钮生成面试反馈报告.",
            activeInterviewId,
          );
          finishInterview();
        } else {
          addAssistantMessage(next_question);
        }

        setActiveInterviewRound(resultRound);
      } else {
        // 闲聊.
        const { reply } = await chat({ message: content });
        addAssistantMessage(reply);
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
    openInterviewResult(interviewId);
    setFinishDialogOpen(true);
  };

  const handleStartInterviewConfirm = async (data: StartInterviewPayload) => {
    setStartDialogOpen(false);
    try {
      const content = `我要面试${data.target_role}的${DIFFICULTY_OPTIONS.find((d) => d.value === data.difficulty)?.label}岗位,我已有${data.experience_years}年工作经验,技术栈是${data.tech_stack.join(",")}`;
      addUserMessage(content);

      const { first_question, interview_id } = await createInterview(data);
      startInterview(interview_id);

      addAssistantMessage(first_question);
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
