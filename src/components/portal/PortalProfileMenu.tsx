"use client";

import { useEffect, useRef, useState } from "react";
import { LogOut, User } from "lucide-react";

type Props = {
  email: string;
  roleLabel?: string;
  logoutAction: () => Promise<void>;
};

export function PortalProfileMenu({ email, roleLabel, logoutAction }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const initial = (email?.[0] || "A").toUpperCase();

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        aria-label="Profile menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#f5f5f5] font-inter text-[11px] font-semibold text-[#111111] transition hover:bg-[#e5e7eb]"
      >
        {initial}
      </button>
      {open ? (
        <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-56 overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.12)]">
          <div className="border-b border-[#e5e7eb] px-3 py-3">
            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#f5f5f5]">
              <User className="h-4 w-4 text-[#6b7280]" />
            </div>
            <p className="truncate font-inter text-[12px] font-semibold text-[#111111]">{email}</p>
            {roleLabel ? (
              <p className="truncate font-inter text-[11px] text-[#6b7280]">{roleLabel}</p>
            ) : null}
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-2 px-3 py-2.5 font-inter text-[13px] font-medium text-[#6b7280] transition hover:bg-[#f5f5f5] hover:text-[#111111]"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
