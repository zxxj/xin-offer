"use client";

import {
  ChevronLeft,
  ChevronRight,
  MessageSquarePlus,
  LoaderCircle,
  RefreshCw,
  Search,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import InterviewCard from "./interview-card";
import type { SiderProps } from "./types";

const Sider = ({
  items,
  search,
  onSearchChange,
  onSelect,
  collapsed,
  onToggleCollapse,
  onOpenCreateDialog,
  selectedId,
  loading,
  error,
  onRetry,
}: SiderProps) => {
  return (
    <aside
      className={cn(
        "flex h-full flex-col bg-sidebar transition-all duration-200",
        collapsed ? "w-16" : "w-[280px]",
      )}
    >
      {/* 折叠态 */}
      {collapsed ? (
        <div className="flex flex-col items-center gap-4 pt-5">
          <button
            type="button"
            onClick={onToggleCollapse}
            className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            aria-label="展开侧边栏"
          >
            <ChevronRight className="size-[18px]" />
          </button>
          <button
            type="button"
            onClick={onOpenCreateDialog}
            className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            aria-label="新建面试"
          >
            <MessageSquarePlus className="size-[18px]" />
          </button>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <h2 className="text-[15px] font-semibold tracking-tight text-sidebar-foreground">
              面试历史
            </h2>
            <button
              type="button"
              onClick={onToggleCollapse}
              className="flex size-7 items-center justify-center rounded-md text-muted-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
              aria-label="收起侧边栏"
            >
              <ChevronLeft className="size-4" />
            </button>
          </div>

          {/* 搜索 */}
          <div className="relative px-3 pb-3">
            <Search className="pointer-events-none absolute top-1/2 left-5.5 size-3.5 -translate-y-1/2 text-muted-foreground/50" />
            <Input
              type="text"
              placeholder="搜索..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-9 rounded-xl border-sidebar-border/60 bg-background/60 pl-8.5 text-[13px] placeholder:text-muted-foreground/40 focus-visible:ring-1"
            />
          </div>

          {/* 列表 */}
          <div className="-mx-1 flex-1 overflow-y-auto px-2 pb-2">
            {loading ? (
              <div className="flex flex-col items-center gap-2 pt-16 text-center text-xs text-muted-foreground/60">
                <LoaderCircle className="size-4 animate-spin" />
                正在加载面试记录
              </div>
            ) : error ? (
              <div className="flex flex-col items-center gap-3 px-4 pt-16 text-center">
                <p className="text-xs text-destructive">{error}</p>
                <button
                  type="button"
                  onClick={onRetry}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-sidebar-foreground"
                >
                  <RefreshCw className="size-3.5" />
                  重新加载
                </button>
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center gap-1.5 pt-16 text-center">
                <div className="size-10 rounded-full bg-sidebar-accent/50" />
                <p className="text-xs text-muted-foreground/50">
                  暂无面试记录
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-0.5">
                {items.map((item) => (
                  <InterviewCard
                    key={item.id}
                    item={item}
                    selected={selectedId === item.id}
                    onSelect={onSelect}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-sidebar-border/60 px-3 py-3">
            <button
              type="button"
              onClick={onOpenCreateDialog}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-2.5 text-[13px] font-medium text-background transition-opacity hover:opacity-90 active:opacity-80"
            >
              <MessageSquarePlus className="size-4" />
              新建面试
            </button>
          </div>
        </>
      )}
    </aside>
  );
};

export default Sider;
