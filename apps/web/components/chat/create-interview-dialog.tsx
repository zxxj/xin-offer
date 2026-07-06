"use client";

import { useState } from "react";
import { ArrowRight, Loader, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { DIFFICULTY_OPTIONS } from "@/lib/const";

type Difficulty = (typeof DIFFICULTY_OPTIONS)[number]["value"];

export type StartInterviewPayload = {
  target_role: string;
  tech_stack: string[];
  experience_years: number;
  difficulty: string;
};

type StartInterviewDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: StartInterviewPayload) => Promise<void> | void;
};

type FieldErrors = Partial<Record<keyof StartInterviewPayload, string>>;

const initialErrors: FieldErrors = {};

const Field = ({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) => (
  <div className="grid gap-1.5">
    <label
      htmlFor={htmlFor}
      className="text-xs font-medium tracking-wide text-foreground/70 uppercase"
    >
      {label}
    </label>
    {children}
    <p
      className={cn(
        "min-h-3.5 text-xs text-destructive transition-opacity duration-150",
        error ? "opacity-100" : "opacity-0",
      )}
      aria-live="polite"
    >
      {error ?? "·"}
    </p>
  </div>
);

const parseStack = (raw: string) =>
  raw
    .split(/[,，]/)
    .map((s) => s.trim())
    .filter(Boolean);

const validate = (state: {
  targetRole: string;
  techStack: string;
  experienceYears: string;
  difficulty: Difficulty | "";
}): FieldErrors => {
  const errors: FieldErrors = {};

  const role = state.targetRole.trim();
  if (!role) errors.target_role = "请填写目标岗位";

  const stack = parseStack(state.techStack);
  if (stack.length === 0) {
    errors.tech_stack = "请填写至少一个技术栈";
  }

  const yearsRaw = state.experienceYears.trim();
  if (!yearsRaw) {
    errors.experience_years = "请填写经验年限";
  } else if (!/^\d+(\.\d+)?$/.test(yearsRaw)) {
    errors.experience_years = "年限必须为非负数字";
  } else if (Number(yearsRaw) > 60) {
    errors.experience_years = "年限超出合理范围";
  }

  if (!state.difficulty) errors.difficulty = "请选择难度";

  return errors;
};

const StartInterviewDialog = ({
  open,
  onOpenChange,
  onConfirm,
}: StartInterviewDialogProps) => {
  const [targetRole, setTargetRole] = useState("");
  const [techStack, setTechStack] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty | "">("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>(initialErrors);

  const reset = () => {
    setTargetRole("");
    setTechStack("");
    setExperienceYears("");
    setDifficulty("");
    setErrors(initialErrors);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next && !submitting) reset();
    onOpenChange(next);
  };

  const clearError = (field: keyof FieldErrors) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = async () => {
    if (submitting) return;

    const found = validate({
      targetRole,
      techStack,
      experienceYears,
      difficulty,
    });
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    try {
      await onConfirm({
        target_role: targetRole.trim(),
        tech_stack: parseStack(techStack),
        experience_years: Number(experienceYears.trim()),
        difficulty,
      });
      reset();
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={!submitting}
        className={cn(
          "gap-5 rounded-2xl p-6 sm:max-w-md",
          "ring-1 ring-foreground/10 shadow-2xl shadow-foreground/5",
        )}
      >
        <DialogHeader className="gap-3">
          <div className="flex items-center gap-2.5">
            <span
              className={cn(
                "inline-flex size-8 items-center justify-center rounded-full",
                "bg-foreground text-background",
                "shadow-sm",
              )}
            >
              <Sparkles className="size-4" />
            </span>
            <DialogTitle className="text-base font-semibold tracking-tight">
              开始模拟面试
            </DialogTitle>
          </div>
          <DialogDescription className="text-[13px] leading-relaxed text-muted-foreground">
            填写以下信息，全部必填，我会为你定制一场贴近真实场景的面试。
          </DialogDescription>
        </DialogHeader>

        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="grid gap-3.5"
        >
          <Field label="目标岗位" htmlFor="si-role" error={errors.target_role}>
            <Input
              id="si-role"
              placeholder="如：前端工程师"
              value={targetRole}
              onChange={(e) => {
                setTargetRole(e.target.value);
                clearError("target_role");
              }}
              aria-invalid={!!errors.target_role}
              autoComplete="off"
            />
          </Field>

          <Field label="技术栈" htmlFor="si-stack" error={errors.tech_stack}>
            <Input
              id="si-stack"
              placeholder="逗号分隔，如：React, TypeScript, Node"
              value={techStack}
              onChange={(e) => {
                setTechStack(e.target.value);
                clearError("tech_stack");
              }}
              aria-invalid={!!errors.tech_stack}
              autoComplete="off"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field
              label="经验年限"
              htmlFor="si-years"
              error={errors.experience_years}
            >
              <Input
                id="si-years"
                type="number"
                min={0}
                max={60}
                placeholder="如：3"
                value={experienceYears}
                onChange={(e) => {
                  setExperienceYears(e.target.value);
                  clearError("experience_years");
                }}
                aria-invalid={!!errors.experience_years}
                autoComplete="off"
              />
            </Field>

            <Field
              label="难度"
              htmlFor="si-difficulty"
              error={errors.difficulty}
            >
              <Select
                value={difficulty}
                onValueChange={(v) => {
                  setDifficulty(v as Difficulty);
                  clearError("difficulty");
                }}
              >
                <SelectTrigger
                  id="si-difficulty"
                  aria-invalid={!!errors.difficulty}
                  className="h-9 w-full rounded-lg border-input bg-transparent px-2.5 text-sm dark:bg-input/30"
                >
                  <SelectValue placeholder="请选择难度" />
                </SelectTrigger>
                <SelectContent>
                  {DIFFICULTY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
        </form>

        <DialogFooter className="-mx-6 -mb-6 mt-1 rounded-b-2xl border-t border-foreground/5 bg-muted/40 px-6 py-4 sm:flex-row sm:justify-end sm:gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={submitting}
            className="rounded-full"
          >
            取消
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="group rounded-full shadow-sm transition-all duration-200 hover:shadow-md active:scale-[0.98]"
          >
            {submitting ? (
              <>
                <Loader className="mr-1.5 size-3.5 animate-spin" />
                准备中…
              </>
            ) : (
              <>
                开始面试
                <ArrowRight className="ml-1.5 size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StartInterviewDialog;