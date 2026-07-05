import type { Message } from "@/components/chat/types";

export const DIFFICULTY_OPTIONS = [
  { value: "junior", label: "初级" },
  { value: "middle", label: "中级" },
  { value: "senior", label: "高级" },
] as const;

export const INITIAL_MESSAGES: Message[] = [
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
];
