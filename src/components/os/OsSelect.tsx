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
    openUp: boolean;
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
        width: Math.max(rect.width, 160),
        openUp,
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
              transform: menuPos.openUp ? "translateY(-100%)" : undefined,
            }}
            className="os-custom-select-menu overflow-auto rounded-xl border border-[#e5e7eb] bg-white py-1 text-[#111111] shadow-[0_12px_40px_rgba(0,0,0,0.12)]"
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
                      "flex w-full px-3 py-2.5 text-left font-inter text-sm transition-colors",
                      active
                        ? "bg-[#f5f5f5] font-medium text-[#111111]"
                        : "text-[#374151] hover:bg-[#f8f9fa]"
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
          "os-custom-select-trigger flex h-11 w-full items-center justify-between rounded-xl border border-[#e5e7eb] bg-white px-3 text-left font-inter text-sm text-[#111111]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111]/20",
          "disabled:cursor-not-allowed disabled:opacity-50",
          !selected && "text-[#898989]"
        )}
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
            "ml-2 shrink-0 text-[#6b7280] transition-transform",
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
