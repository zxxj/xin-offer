"use client";

import * as React from "react";
import { Send } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";

type InputBoxProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
};

const InputBox = ({
  value,
  onChange,
  onSend,
  disabled,
  placeholder = "输入消息，回车发送，Shift+回车换行",
  className,
}: InputBoxProps) => {
  const canSend = !disabled && value.trim().length > 0;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (canSend) onSend();
    }
  };

  return (
    <div className={cn("w-full px-4 pb-4", className)}>
      <div className="mx-auto w-full max-w-3xl">
        <InputGroup className="rounded-2xl">
          <InputGroupTextarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="max-h-40 min-h-10 px-4 py-3 text-sm"
          />
          <InputGroupAddon align="inline-end" className="self-end pb-1.5 pr-1.5">
            <InputGroupButton
              size="icon-sm"
              variant="default"
              onClick={onSend}
              disabled={!canSend}
              aria-label="发送"
            >
              <Send />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </div>
    </div>
  );
};

export default InputBox;
