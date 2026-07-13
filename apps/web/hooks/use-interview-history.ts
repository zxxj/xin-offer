"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { getInterviews, type InterviewHistoryItem } from "@/services/interview";

const SELECTED_INTERVIEW_STORAGE_KEY = "xin-offer:selected-interview-id";

/**
 * 面试历史管理 hook.
 * - 获取历史列表
 * - 本地搜索过滤
 * - 当前选中状态
 * - 手动刷新
 */
export const useInterviewHistory = () => {
  const [items, setItems] = useState<InterviewHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // 加载历史列表.
  const fetchHistory = useCallback(async () => {
    try {
      const data = await getInterviews();
      setItems(data);
      setError(null);
    } catch (err) {
      console.error("获取面试历史失败:", err);
      setError("获取面试历史失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchHistory();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [fetchHistory]);

  // 搜索过滤: 匹配 target_role 或 tech_stack(逗号分割).
  const filteredItems = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return items;

    return items.filter((item) => {
      if (item.target_role.toLowerCase().includes(keyword)) return true;

      const techKeywords = item.tech_stack
        .split(",")
        .map((t) => t.trim().toLowerCase());
      return techKeywords.some((t) => t.includes(keyword));
    });
  }, [items, search]);

  const handleSelect = useCallback((interviewId: string) => {
    setSelectedId(interviewId);
    window.sessionStorage.setItem(SELECTED_INTERVIEW_STORAGE_KEY, interviewId);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedId(null);
    window.sessionStorage.removeItem(SELECTED_INTERVIEW_STORAGE_KEY);
  }, []);

  // 读取上次查看的历史会话,由页面在列表加载完成后恢复消息内容.
  const getSavedSelectedId = useCallback(() => {
    return window.sessionStorage.getItem(SELECTED_INTERVIEW_STORAGE_KEY);
  }, []);

  // 刷新列表但不丢失选中状态.
  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getInterviews();
      setItems(data);
    } catch (err) {
      console.error("获取面试历史失败:", err);
      setError("获取面试历史失败");
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    items,
    filteredItems,
    loading,
    error,
    search,
    selectedId,
    onSearchChange: setSearch,
    onSelect: handleSelect,
    clearSelection,
    getSavedSelectedId,
    refresh,
  };
};
