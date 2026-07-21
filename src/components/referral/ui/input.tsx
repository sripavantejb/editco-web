import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => (
  <input
    type={type}
    className={cn(
      "flex h-11 w-full rounded-xl border border-[var(--dash-border,rgba(255,255,255,0.1))] bg-[var(--dash-input,rgba(255,255,255,0.05))] px-3 py-2 text-sm text-[var(--dash-text,#fff)] placeholder:text-[var(--dash-faint,rgba(255,255,255,0.35))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gaude-orange disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    ref={ref}
    {...props}
  />
));
Input.displayName = "Input";
