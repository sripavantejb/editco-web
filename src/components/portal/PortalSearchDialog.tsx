"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, X, FileText, Building2, Hash, LayoutDashboard } from "lucide-react";
import { quickOsSearch, type QuickSearchHit } from "@/actions/os/quick-search";

export type NavSearchItem = { href: string; label: string; section?: string };

type Props = {
  open: boolean;
  onClose: () => void;
  /** Instant local nav matches — no network. */
  navItems: NavSearchItem[];
  /** Enable OS DB quick search (Super Admin). */
  enableOsSearch?: boolean;
  placeholder?: string;
};

export function PortalSearchDialog({
  open,
  onClose,
  navItems,
  enableOsSearch = false,
  placeholder = "Search pages, codes, companies…",
}: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [remote, setRemote] = useState<QuickSearchHit[]>([]);
  const [pending, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!open) return;
    setQ("");
    setRemote([]);
    const t = setTimeout(() => inputRef.current?.focus(), 30);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const localHits = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return navItems.slice(0, 8);
    return navItems
      .filter(
        (item) =>
          item.label.toLowerCase().includes(needle) ||
          item.href.toLowerCase().includes(needle) ||
          (item.section || "").toLowerCase().includes(needle)
      )
      .slice(0, 12);
  }, [q, navItems]);

  const runRemote = useCallback(
    (value: string) => {
      if (!enableOsSearch) return;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        startTransition(async () => {
          try {
            const hits = await quickOsSearch(value);
            setRemote(hits);
          } catch {
            setRemote([]);
          }
        });
      }, 120);
    },
    [enableOsSearch]
  );

  const onChange = (value: string) => {
    setQ(value);
    if (value.trim().length >= 2) runRemote(value);
    else setRemote([]);
  };

  const go = (href: string) => {
    onClose();
    router.push(href);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center px-4 pt-[12vh]">
      <button
        type="button"
        aria-label="Close search"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white shadow-[0_24px_80px_rgba(0,0,0,0.18)]">
        <div className="flex items-center gap-2 border-b border-[#e5e7eb] px-4">
          <Search className="h-4 w-4 shrink-0 text-[#6b7280]" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="h-14 w-full bg-transparent font-inter text-[15px] text-[#111111] outline-none placeholder:text-[#898989]"
          />
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#6b7280] hover:bg-[#f5f5f5]"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[50vh] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {localHits.length > 0 ? (
            <div className="border-b border-[#f3f4f6] px-2 py-2">
              <p className="px-2 py-1 font-inter text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6b7280]">
                Pages
              </p>
              {localHits.map((item) => (
                <button
                  key={item.href}
                  type="button"
                  onClick={() => go(item.href)}
                  className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left hover:bg-[#f5f5f5]"
                >
                  <LayoutDashboard className="h-4 w-4 shrink-0 text-[#6b7280]" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-inter text-sm font-medium text-[#111111]">
                      {item.label}
                    </span>
                    {item.section ? (
                      <span className="block truncate font-inter text-xs text-[#6b7280]">
                        {item.section}
                      </span>
                    ) : null}
                  </span>
                </button>
              ))}
            </div>
          ) : null}

          {enableOsSearch && q.trim().length >= 2 ? (
            <div className="px-2 py-2">
              <p className="px-2 py-1 font-inter text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6b7280]">
                {pending ? "Searching…" : "Records"}
              </p>
              {remote.map((hit) => {
                const Icon =
                  hit.kind === "client"
                    ? Building2
                    : hit.kind === "invoice"
                      ? FileText
                      : Hash;
                return (
                  <button
                    key={`${hit.kind}-${hit.href}`}
                    type="button"
                    onClick={() => go(hit.href)}
                    className="flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left hover:bg-[#f5f5f5]"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-[#6b7280]" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-inter text-sm font-medium text-[#111111]">
                        {hit.title}
                      </span>
                      <span className="block truncate font-inter text-xs text-[#6b7280]">
                        {hit.subtitle}
                      </span>
                    </span>
                  </button>
                );
              })}
              {!pending && remote.length === 0 ? (
                <p className="px-2 py-3 font-inter text-sm text-[#6b7280]">No matching records.</p>
              ) : null}
            </div>
          ) : null}

          {q.trim() && localHits.length === 0 && (!enableOsSearch || q.trim().length < 2) ? (
            <p className="px-4 py-6 font-inter text-sm text-[#6b7280]">No pages match.</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
