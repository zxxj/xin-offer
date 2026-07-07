"use client";

import { useState } from "react";
import InputBox from "./input-box";
import MessageList from "./message-list";
import CreateInterviewDialog, {
  type StartInterviewPayload,
} from "./create-interview-dialog";
import { chat } from "@/services/chat";
import { createInterview, interview } from "@/services/interview";
import { DIFFICULTY_OPTIONS } from "@/lib/const";
import InterviewResultDialog from "./interview-result-dialog";
import { useChatMessages } from "@/hooks/use-chat-messages";
import { useInterviewSession } from "@/hooks/use-interview-session";

const Chat = () => {
  const {
    messages,
    addUserMessage,
    addAssistantMessage,
    addAssistantFinishMessage,
    addAssistantErrorMessage,
  } = useChatMessages();

  const {
    activeInterviewId,
    interviewFinishId,
    startInterview,
    finishInterview,
    openInterviewResult,
  } = useInterviewSession();

  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [startingInterview, setStartingInterview] = useState<boolean>(false);
  const [startDialogOpen, setStartDialogOpen] = useState(false);
  const [finishDialogOpen, setFinishDialogOpen] = useState(false);

  const handleSend = async () => {
    const content = input.trim();
    if (!content || sending) return;

    addUserMessage(content);
    setInput("");

    try {
      setSending(true);

      if (activeInterviewId) {
        await handleInterviewAnswer(content);
      } else {
        await handleChatMessage(content);
      }
    } catch (error) {
      console.error(error);
      addAssistantErrorMessage();
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

  // 创建面试会话.
  const handleCreateInterview = async (data: StartInterviewPayload) => {
    const content = `我要面试${data.target_role}的${DIFFICULTY_OPTIONS.find((d) => d.value === data.difficulty)?.label}岗位,我已有${data.experience_years}年工作经验,技术栈是${data.tech_stack.join(",")}`;
    addUserMessage(content);
    const { first_question, interview_id } = await createInterview(data);
    startInterview(interview_id);
    addAssistantMessage(first_question);
  };

  // 创建面试弹框的确认按钮.
  const handleStartInterviewConfirm = async (data: StartInterviewPayload) => {
    if (startingInterview) return;

    setStartingInterview(true);
    setStartDialogOpen(false);
    try {
      await handleCreateInterview(data);
    } catch (error) {
      console.error(error);
      addAssistantErrorMessage("创建面试会话失败,请重试.");
    } finally {
      setStartingInterview(false);
    }
  };

  // 闲聊模式.
  const handleChatMessage = async (content: string) => {
    const { reply } = await chat({ message: content });
    addAssistantMessage(reply);
  };

  // 面试模式.
  const handleInterviewAnswer = async (content: string) => {
    // 如果不是面试状态,直接结束.
    if (!activeInterviewId) return;

    const { next_question, is_finished } = await interview({
      interview_id: activeInterviewId,
      answer: content,
    });

    if (is_finished) {
      addAssistantFinishMessage(
        "面试已结束,点击下方按钮生成面试结果.",
        activeInterviewId,
      );

      finishInterview();
    } else {
      addAssistantMessage(next_question);
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
        disabled={sending || startingInterview}
      />
      <CreateInterviewDialog
        open={startDialogOpen}
        onOpenChange={setStartDialogOpen}
        onConfirm={handleStartInterviewConfirm}
      />

      <InterviewResultDialog
        open={finishDialogOpen}
        onOpenChange={setFinishDialogOpen}
        interviewId={interviewFinishId}
      />
    </div>
  );
};

export default Chat;
