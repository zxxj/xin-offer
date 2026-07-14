"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Menu } from "lucide-react";

import InputBox from "./input-box";
import MessageList from "./message-list";
import Sider from "./sider";
import CreateInterviewDialog, {
  type StartInterviewPayload,
} from "./create-interview-dialog";
import { chat, chatStream } from "@/services/chat";
import {
  createInterview,
  interview,
  getInterviewMessages,
} from "@/services/interview";
import { DIFFICULTY_OPTIONS } from "@/lib/const";
import InterviewResultDialog from "./interview-result-dialog";
import { useChatMessages } from "@/hooks/use-chat-messages";
import { useInterviewSession } from "@/hooks/use-interview-session";
import { useInterviewHistory } from "@/hooks/use-interview-history";
import { createAssistantInterviewFinishedMessage } from "@/lib/chat";
import type { InterviewResultMode, Message } from "./types";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";

const Chat = () => {
  const {
    messages,
    addUserMessage,
    addAssistantMessage,
    addAssistantFinishMessage,
    addAssistantErrorMessage,
    loadMessages,
    resetMessages,
    startAssistantStreamMessage,
    appendAssistantStreamDelta,
  } = useChatMessages();

  const {
    activeInterviewId,
    interviewFinishId,
    startInterview,
    finishInterview,
    openInterviewResult,
  } = useInterviewSession();

  const {
    items,
    filteredItems,
    loading: historyLoading,
    error: historyError,
    search,
    selectedId,
    onSearchChange,
    onSelect,
    clearSelection,
    getSavedSelectedId,
    refresh,
  } = useInterviewHistory();

  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [startingInterview, setStartingInterview] = useState<boolean>(false);
  const [startDialogOpen, setStartDialogOpen] = useState(false);
  const [finishDialogOpen, setFinishDialogOpen] = useState(false);
  const [resultDialogMode, setResultDialogMode] =
    useState<InterviewResultMode>("generate");
  const [siderCollapsed, setSiderCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [isHistoryReadOnly, setIsHistoryReadOnly] = useState(false);
  const hasRestoredHistoryRef = useRef(false);

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

  const handleViewInterviewResultButton = (
    interviewId: string,
    mode: InterviewResultMode,
  ) => {
    openInterviewResult(interviewId);
    setResultDialogMode(mode);
    setFinishDialogOpen(true);
  };

  // 创建面试会话.
  const handleCreateInterview = async (data: StartInterviewPayload) => {
    const content = `我要面试${data.target_role}的${DIFFICULTY_OPTIONS.find((d) => d.value === data.difficulty)?.label}岗位,我已有${data.experience_years}年工作经验,技术栈是${data.tech_stack.join(",")}`;
    const { first_question, interview_id } = await createInterview(data);

    // 新面试不能和正在查看的历史消息混在同一个对话列表中.
    resetMessages();
    setIsHistoryReadOnly(false);
    clearSelection();
    addUserMessage(content);
    startInterview(interview_id);
    addAssistantMessage(first_question);
    await refresh();
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
    const messageId = await startAssistantStreamMessage();

    await chatStream({
      message: content,
      onDelta: (delta) => {
        appendAssistantStreamDelta(messageId, delta);
      },
    });
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

  /**
   * 加载指定历史会话到主聊天区.
   * - 如果会话状态为 in_progress,恢复面试模式(可继续对话).
   * - 如果会话已结束,仅展示历史消息(只读).
   */
  const loadHistoryIntoChat = useCallback(
    async (interviewId: string) => {
      try {
        setLoadingHistory(true);
        const msgList = await getInterviewMessages(interviewId);

        // 将后端消息格式转换为前端 Message 类型.
        const restored: Message[] = msgList.map((m) => ({
          id: `history-${m.id}`,
          type: "text" as const,
          role: m.role as "user" | "assistant",
          content: m.content,
        }));

        // 找到对应的面试项,判断是否需要恢复面试模式.
        const interviewItem = items.find((it) => it.id === interviewId);
        if (interviewItem?.status === "in_progress") {
          startInterview(interviewId);
          setIsHistoryReadOnly(false);
        } else {
          finishInterview();
          setIsHistoryReadOnly(true);

          if (interviewItem?.status === "reported") {
            restored.push(
              createAssistantInterviewFinishedMessage(
                "这场面试已生成反馈报告,点击下方按钮查看.",
                interviewId,
                "view",
              ),
            );
          } else if (interviewItem?.status === "finished") {
            restored.push(
              createAssistantInterviewFinishedMessage(
                "面试已结束,点击下方按钮生成面试结果.",
                interviewId,
              ),
            );
          }
        }

        loadMessages(restored);
      } catch (error) {
        console.error("加载历史会话失败:", error);
        addAssistantErrorMessage("加载历史会话失败,请重试.");
      } finally {
        setLoadingHistory(false);
      }
    },
    [
      addAssistantErrorMessage,
      finishInterview,
      items,
      loadMessages,
      startInterview,
    ],
  );

  // 刷新页面后,恢复上次选中的会话和对应消息. ref 保证只执行一次.
  useEffect(() => {
    if (historyLoading || hasRestoredHistoryRef.current) return;

    hasRestoredHistoryRef.current = true;
    const interviewId = getSavedSelectedId();
    if (!interviewId) return;

    const timer = window.setTimeout(() => {
      if (items.some((item) => item.id === interviewId)) {
        onSelect(interviewId);
        void loadHistoryIntoChat(interviewId);
      } else {
        clearSelection();
      }
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    clearSelection,
    getSavedSelectedId,
    historyLoading,
    items,
    loadHistoryIntoChat,
    onSelect,
  ]);

  /**
   * 侧边栏点击历史会话.
   */
  const handleSiderSelect = async (interviewId: string) => {
    onSelect(interviewId);
    await loadHistoryIntoChat(interviewId);
    setMobileMenuOpen(false); // 关闭移动端抽屉.
  };

  /** 侧边栏组件实例(桌面端与移动端复用). */
  const siderContent = (
    <Sider
      items={filteredItems}
      search={search}
      onSearchChange={onSearchChange}
      onSelect={handleSiderSelect}
      collapsed={siderCollapsed}
      onToggleCollapse={() => setSiderCollapsed(!siderCollapsed)}
      onOpenCreateDialog={() => {
        // 打开新建弹框时清除选中态,表示离开"查看历史"模式.
        clearSelection();
        setStartDialogOpen(true);
        setMobileMenuOpen(false);
      }}
      selectedId={selectedId}
      loading={historyLoading}
      error={historyError}
      onRetry={refresh}
    />
  );

  return (
    <div className="flex h-screen w-screen flex-row bg-background">
      {/* 桌面端: 固定侧边栏(lg 及以上可见) */}
      <div className="hidden lg:flex">{siderContent}</div>

      {/* 主聊天区域 */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* 移动端顶部: Menu 触发按钮 */}
        <div className="flex items-center gap-3 border-b border-sidebar-border/60 px-4 py-3 lg:hidden">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className="flex size-8 items-center justify-center rounded-lg text-foreground/70 transition-colors hover:bg-sidebar-accent"
                aria-label="打开侧边栏"
              >
                <Menu className="size-[18px]" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" showCloseButton className="w-[280px] p-0">
              {siderContent}
            </SheetContent>
          </Sheet>
          <span className="text-sm font-semibold tracking-tight">面试助手</span>
        </div>

        <MessageList
          messages={messages}
          handleStartInterviewButton={handleStartInterviewButton}
          handleViewInterviewResultButton={handleViewInterviewResultButton}
        />
        <InputBox
          value={input}
          onChange={setInput}
          onSend={handleSend}
          disabled={
            sending || startingInterview || loadingHistory || isHistoryReadOnly
          }
          placeholder={
            isHistoryReadOnly
              ? "这场面试已结束,请从侧边栏新建一场面试"
              : undefined
          }
        />
      </main>

      {/* Dialogs */}
      <CreateInterviewDialog
        open={startDialogOpen}
        onOpenChange={setStartDialogOpen}
        onConfirm={handleStartInterviewConfirm}
      />

      <InterviewResultDialog
        open={finishDialogOpen}
        onOpenChange={setFinishDialogOpen}
        interviewId={interviewFinishId}
        mode={resultDialogMode}
        onReportGenerated={refresh}
      />
    </div>
  );
};

export default Chat;
