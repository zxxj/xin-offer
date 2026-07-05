import { useState } from "react";

export const useInterviewSession = () => {
  // 当前面试会话的ID.
  const [activeInterviewId, setActiveInterviewId] = useState<string | null>(
    null,
  );
  // 面试结果ID.
  const [interviewFinishId, setInterviewFinishId] = useState<string | null>(
    null,
  );
  // 当前面试会话的轮次.
  const [activeInterviewRound, setActiveInterviewRound] = useState<number>(1);

  // 创建面试会话成功后,保存接口返回的ID.
  const startInterview = (interviewId: string) => {
    setActiveInterviewId(interviewId);
    setInterviewFinishId(interviewId);
    setActiveInterviewRound(1);
  };

  // 面试模式中,轮次到了阈值就表示面试结束了.清除面试会话ID,回到闲聊模式.
  const finishInterview = () => {
    setActiveInterviewId(null);
  };

  // 根据面试会话ID查询面试结果.
  const openInterviewResult = (interviewId: string) => {
    setInterviewFinishId(interviewId);
  };

  return {
    interviewFinishId,
    activeInterviewId,
    activeInterviewRound,
    setActiveInterviewRound,
    startInterview,
    finishInterview,
    openInterviewResult,
  };
};
