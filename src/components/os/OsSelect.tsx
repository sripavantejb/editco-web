"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

export type OsSelectOption = {
  value: string;
  label: string;
};

export function OsSelect({
  name,
  options,
  value,
  defaultValue = "",
  onChange,
  placeholder = "Select",
  required = false,
  disabled = false,
  className,
}: {
  name?: string;
  options: OsSelectOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState(defaultValue);
  const selected = isControlled ? value : internal;
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [menuPos, setMenuPos] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const listId = useId();

  const selectedLabel =
    options.find((o) => o.value === selected)?.label ||
    (selected ? selected : placeholder);

  useEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!open || !buttonRef.current) return;

    function place() {
      const rect = buttonRef.current!.getBoundingClientRect();
      const maxH = 240;
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUp = spaceBelow < maxH && rect.top > spaceBelow;
      setMenuPos({
        top: openUp ? rect.top - 4 : rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    }

    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      const t = e.target as Node;
      if (rootRef.current?.contains(t)) return;
      if (menuRef.current?.contains(t)) return;
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function choose(next: string) {
    if (!isControlled) setInternal(next);
    onChange?.(next);
    setOpen(false);
  }

  const menu =
    open && mounted && menuPos
      ? createPortal(
          <ul
            ref={menuRef}
            id={listId}
            role="listbox"
            style={{
              position: "fixed",
              top: menuPos.top,
              left: menuPos.left,
              width: menuPos.width,
              maxHeight: 240,
              zIndex: 9999,
              backgroundColor: "#121212",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "#f5f5f5",
              transform:
                menuPos.top < (buttonRef.current?.getBoundingClientRect().top ?? 0)
                  ? "translateY(-100%)"
                  : undefined,
            }}
            className="overflow-auto rounded-xl py-1 shadow-[0_16px_40px_rgba(0,0,0,0.65)]"
          >
            {options.map((opt) => {
              const active = opt.value === selected;
              return (
                <li key={opt.value || "__empty"}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => choose(opt.value)}
                    className={cn(
                      "flex w-full px-3 py-2.5 text-left text-sm transition-colors",
                      active
                        ? "bg-[rgba(200,245,66,0.16)] text-[#c8f542]"
                        : "text-[#f5f5f5] hover:bg-white/10"
                    )}
                  >
                    {opt.label}
                  </button>
                </li>
              );
            })}
          </ul>,
          document.body
        )
      : null;

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      {name ? (
        <input type="hidden" name={name} value={selected} required={required} />
      ) : null}
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex h-11 w-full items-center justify-between rounded-xl border border-[var(--dash-border)] px-3 text-left text-sm text-[var(--dash-text)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gaude-orange",
          "disabled:cursor-not-allowed disabled:opacity-50",
          !selected && "text-[var(--dash-faint)]"
        )}
        style={{ backgroundColor: "#1a1a1a" }}
      >
        <span className="truncate">{selectedLabel}</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={cn(
            "ml-2 shrink-0 text-[var(--dash-muted)] transition-transform",
            open && "rotate-180"
          )}
          aria-hidden
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {menu}
    </div>
  );
}
