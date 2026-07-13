"use client";

import { cn } from "@/lib/utils";
import type { InterviewCardProps } from "./types";

/** 状态中文 + 样式. */
const STATUS_MAP: Record<
  string,
  { label: string; className: string }
> = {
  in_progress: {
    label: "进行中",
    className: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  finished: {
    label: "已完成",
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  reported: {
    label: "已报告",
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
};

/** 难度标签. */
const DIFF_MAP: Record<string, string> = {
  junior: "初级",
  middle: "中级",
  senior: "高级",
};

/** 相对时间. */
function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffDays === 0) {
    const h = date.getHours().toString().padStart(2, "0");
    const m = date.getMinutes().toString().padStart(2, "0");
    return `${h}:${m}`;
  }
  if (diffDays === 1) return "昨天";
  if (diffDays < 7) return `${diffDays}天前`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`;
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

const InterviewCard = ({ item, selected, onSelect }: InterviewCardProps) => {
  const status = STATUS_MAP[item.status] ?? {
    label: item.status,
    className: "bg-muted text-muted-foreground",
  };

  const techs = item.tech_stack
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 2);

  return (
    <button
      type="button"
      onClick={() => onSelect(item.id)}
      className={cn(
        "group flex w-full flex-col gap-2 rounded-xl px-3 py-3 text-left transition-all duration-150",
        selected
          ? "bg-sidebar-accent shadow-sm shadow-sidebar-accent/40"
          : "hover:bg-sidebar-accent/60",
      )}
    >
      {/* 第一行: 岗位 + 时间 */}
      <div className="flex items-baseline justify-between gap-3">
        <span className="truncate text-[13px] font-medium text-sidebar-foreground">
          {item.target_role}
        </span>
        <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground/40">
          {formatTime(item.created_at)}
        </span>
      </div>

      {/* 第二行: 标签行 */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="rounded-md bg-sidebar-primary/8 px-1.5 py-0.5 text-[11px] text-muted-foreground/70">
          {DIFF_MAP[item.difficulty] ?? item.difficulty}
        </span>
        <span
          className={cn(
            "rounded-md px-1.5 py-0.5 text-[11px] font-medium",
            status.className,
          )}
        >
          {status.label}
        </span>
        {techs.map((t) => (
          <span
            key={t}
            className="rounded-md bg-background/50 px-1.5 py-0.5 text-[11px] text-muted-foreground/50"
          >
            {t}
          </span>
        ))}
      </div>
    </button>
  );
};

export default InterviewCard;
