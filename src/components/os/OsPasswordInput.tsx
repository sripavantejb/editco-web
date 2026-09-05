"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { osInputClass } from "@/components/os/ui";
import { cn } from "@/lib/utils";

export function OsPasswordInput({
  name,
  required = false,
  className,
}: {
  name: string;
  required?: boolean;
  className?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        name={name}
        type={visible ? "text" : "password"}
        required={required}
        autoComplete="new-password"
        className={cn(osInputClass(), "pr-11", className)}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-[var(--dash-muted)] transition-colors hover:text-[var(--dash-text)]"
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}
