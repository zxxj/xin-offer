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
};

export type Message =
  | TextMessage
  | StartInterviewMessage
  | InterviewFinishMessage;

export type MessageListProps = {
  messages: Message[];
  className?: string;
  handleStartInterviewButton: () => void;
  handleViewInterviewResultButton: (interviewId: string) => void;
};
