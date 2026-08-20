"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";
import { osInputClass } from "@/components/os/ui";

type OsDateKind = "date" | "datetime-local";

/** Dark-theme friendly date/datetime input that opens the native calendar on click. */
export function OsDateInput({
  name,
  defaultValue,
  value,
  onChange,
  required,
  className,
  type = "date",
}: {
  name: string;
  defaultValue?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  className?: string;
  type?: OsDateKind;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const controlled = value !== undefined;

  function openPicker() {
    const el = ref.current;
    if (!el) return;
    try {
      (el as HTMLInputElement & { showPicker?: () => void }).showPicker?.();
    } catch {
      // ignore — user can still type / use native control
    }
  }

  return (
    <div className="relative">
      <input
        ref={ref}
        type={type}
        name={name}
        required={required}
        {...(controlled
          ? { value, onChange }
          : { defaultValue })}
        onClick={openPicker}
        onFocus={openPicker}
        className={cn(
          osInputClass(),
          "os-date-input cursor-pointer pr-10",
          className
        )}
      />
      <button
        type="button"
        tabIndex={-1}
        aria-label="Open calendar"
        onClick={openPicker}
        className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-[var(--dash-muted)] hover:text-[var(--dash-accent)]"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          className="h-4 w-4"
          aria-hidden
        >
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M3 9h18M8 3v4M16 3v4" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
