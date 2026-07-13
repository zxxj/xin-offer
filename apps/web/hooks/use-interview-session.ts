import { useCallback, useState } from "react";

export const useInterviewSession = () => {
  // 当前面试会话的ID.
  const [activeInterviewId, setActiveInterviewId] = useState<string | null>(
    null,
  );
  // 面试结果ID.
  const [interviewFinishId, setInterviewFinishId] = useState<string | null>(
    null,
  );

  // 创建面试会话成功后,保存接口返回的ID.
  const startInterview = useCallback((interviewId: string) => {
    setActiveInterviewId(interviewId);
    setInterviewFinishId(interviewId);
  }, []);

  // 面试模式中,轮次到了阈值就表示面试结束了.清除面试会话ID,回到闲聊模式.
  const finishInterview = useCallback(() => {
    setActiveInterviewId(null);
  }, []);

  // 根据面试会话ID查询面试结果.
  const openInterviewResult = useCallback((interviewId: string) => {
    setInterviewFinishId(interviewId);
  }, []);

  return {
    interviewFinishId,
    activeInterviewId,
    startInterview,
    finishInterview,
    openInterviewResult,
  };
};
