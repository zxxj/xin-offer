"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Lightbulb,
  Loader,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  finishInterview,
  type FinishInterviewMessage,
  type FinishInterviewResponse,
} from "@/services/interview";
import { cn } from "@/lib/utils";

type InterviewResultDialogProps = {
  open: boolean;
  interviewId: string | null;
  messages: FinishInterviewMessage[];
  onOpenChange: (open: boolean) => void;
};

const RING_RADIUS = 45;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const ScoreRing = ({ score }: { score: number }) => {
  const clamped = Math.max(0, Math.min(100, score));
  const offset = RING_CIRCUMFERENCE * (1 - clamped / 100);
  return (
    <div className="flex flex-col items-center justify-center py-2">
      <div className="relative size-36">
        <svg className="size-full -rotate-90" viewBox="0 0 100 100" aria-hidden>
          <circle
            cx="50"
            cy="50"
            r={RING_RADIUS}
            className="stroke-muted fill-none"
            strokeWidth={6}
          />
          <circle
            cx="50"
            cy="50"
            r={RING_RADIUS}
            className="stroke-foreground fill-none transition-[stroke-dashoffset] duration-1000 ease-out"
            strokeWidth={6}
            strokeDasharray={RING_CIRCUMFERENCE}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-semibold tracking-tight tabular-nums">
            {clamped}
          </span>
          <span className="mt-0.5 text-[11px] tracking-widest text-muted-foreground uppercase">
            / 100
          </span>
        </div>
      </div>
      <p className="mt-2 text-xs tracking-widest text-muted-foreground uppercase">
        综合评分
      </p>
    </div>
  );
};

const Section = ({
  icon: Icon,
  title,
  items,
}: {
  icon: LucideIcon;
  title: string;
  items: string[];
}) => (
  <div className="rounded-xl border border-foreground/10 bg-background/40 p-4">
    <div className="flex items-center gap-2 pb-2">
      <span className="inline-flex size-6 items-center justify-center rounded-full bg-foreground text-background">
        <Icon className="size-3.5" />
      </span>
      <h4 className="text-sm font-medium tracking-tight">{title}</h4>
    </div>
    {items.length === 0 ? (
      <p className="pl-8 text-sm text-muted-foreground">暂无</p>
    ) : (
      <ul className="grid gap-1.5 pl-8 text-sm leading-relaxed text-foreground/85">
        {items.map((item, idx) => (
          <li key={idx} className="relative">
            <span className="absolute -left-4 top-2.5 size-1 rounded-full bg-foreground/60" />
            {item}
          </li>
        ))}
      </ul>
    )}
  </div>
);

const InterviewResultDialog = ({
  open,
  interviewId,
  messages,
  onOpenChange,
}: InterviewResultDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FinishInterviewResponse | null>(null);

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setResult(null);
      setError(null);
      setLoading(false);
    }
    onOpenChange(next);
  };

  useEffect(() => {
    if (!open || !interviewId) return;

    let cancelled = false;
    const fetchResult = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await finishInterview(interviewId, messages);
        if (!cancelled) setResult(data);
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "加载失败");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchResult();
    return () => {
      cancelled = true;
    };
  }, [open, interviewId, messages]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          "gap-5 rounded-2xl p-6 sm:max-w-lg",
          "ring-1 ring-foreground/10 shadow-2xl shadow-foreground/5",
        )}
      >
        <DialogHeader className="gap-2 text-left">
          <DialogTitle className="text-base font-semibold tracking-tight">
            面试反馈报告
          </DialogTitle>
          {interviewId && (
            <p className="font-mono text-[11px] tracking-wide text-muted-foreground">
              面试 ID：{interviewId}
            </p>
          )}
        </DialogHeader>

        {loading && (
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-sm text-muted-foreground">
            <Loader className="size-5 animate-spin" />
            正在生成反馈报告…
          </div>
        )}

        {!loading && error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            反馈加载失败：{error}
          </div>
        )}

        {!loading && !error && result && (
          <div className="grid gap-4">
            <ScoreRing score={result.score} />
            <div className="grid gap-2.5">
              <Section
                icon={CheckCircle2}
                title="优点"
                items={result.strengths}
              />
              <Section
                icon={AlertCircle}
                title="不足"
                items={result.weaknesses}
              />
              <Section
                icon={Lightbulb}
                title="学习建议"
                items={result.suggestions}
              />
            </div>
          </div>
        )}

        <div className="-mx-6 -mb-6 mt-1 flex justify-end rounded-b-2xl border-t border-foreground/5 bg-muted/40 px-6 py-4">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            className="rounded-full"
          >
            关闭
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InterviewResultDialog;
