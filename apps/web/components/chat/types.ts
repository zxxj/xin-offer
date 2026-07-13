export type InterviewResultMode = "generate" | "view";

export type TextMessage = {
  id: string;
  type: "text";
  role: "user" | "assistant";
  content: string;
};

export type StartInterviewMessage = {
  id: string;
  role: "assistant";
  type: "start_interview_button";
  content: string;
};

export type InterviewFinishMessage = {
  id: string;
  role: "assistant";
  type: "interview_finish";
  content: string;
  interviewId: string;
  resultMode: InterviewResultMode;
};

export type Message =
  | TextMessage
  | StartInterviewMessage
  | InterviewFinishMessage;

export type MessageListProps = {
  messages: Message[];
  className?: string;
  handleStartInterviewButton: () => void;
  handleViewInterviewResultButton: (
    interviewId: string,
    resultMode: InterviewResultMode,
  ) => void;
};

// 侧边栏相关类型.
export type InterviewCardProps = {
  item: import("@/services/interview").InterviewHistoryItem;
  selected: boolean;
  onSelect: (interviewId: string) => void;
};

export type SiderProps = {
  items: import("@/services/interview").InterviewHistoryItem[];
  search: string;
  onSearchChange: (value: string) => void;
  onSelect: (interviewId: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onOpenCreateDialog: () => void;
  selectedId?: string | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
};
