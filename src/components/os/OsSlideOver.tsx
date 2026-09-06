"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X, Plus } from "lucide-react";
import { SalesModalContext } from "@/components/sales/SalesModal";
import { cn } from "@/lib/utils";

export const OsSlideOverContext = createContext<{ close: () => void } | null>(null);

export function useOsSlideOver() {
  return useContext(OsSlideOverContext);
}

/**
 * Centered card popup for add/edit forms (not a side drawer).
 * Provides SalesModalContext so OsActionForm closes on success.
 */
export function OsSlideOver({
  triggerLabel = "Add details",
  title,
  subtitle,
  children,
  triggerClassName,
  wide,
}: {
  triggerLabel?: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  triggerClassName?: string;
  wide?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const close = () => setOpen(false);

  const panel = mounted
    ? createPortal(
        <AnimatePresence>
          {open ? (
            <div
              key="form-popup"
              className="admin-theme fixed inset-0 z-[200] flex items-start justify-center overflow-y-auto px-4 py-[8vh]"
            >
              <motion.button
                type="button"
                aria-label="Close"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
                onClick={close}
              />
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-label={title}
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className={cn(
                  "relative z-10 w-full overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white shadow-xl",
                  wide ? "max-w-2xl" : "max-w-xl"
                )}
              >
                <header className="flex items-start justify-between gap-3 border-b border-[#e5e7eb] px-5 py-4">
                  <div className="min-w-0">
                    <h2 className="font-inter text-base font-semibold tracking-[-0.02em] text-[#111111]">
                      {title}
                    </h2>
                    {subtitle ? (
                      <p className="mt-0.5 font-inter text-sm text-[#6b7280]">{subtitle}</p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    aria-label="Close"
                    onClick={close}
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#6b7280] transition hover:bg-[#f5f5f5] hover:text-[#111111]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </header>

                <div className="max-h-[min(72vh,640px)] overflow-y-auto px-5 py-5">
                  <SalesModalContext.Provider value={{ close }}>
                    <OsSlideOverContext.Provider value={{ close }}>
                      {children}
                    </OsSlideOverContext.Provider>
                  </SalesModalContext.Provider>
                </div>
              </motion.div>
            </div>
          ) : null}
        </AnimatePresence>,
        document.body
      )
    : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex h-10 items-center gap-2 rounded-lg bg-[#111111] px-4 font-inter text-[13px] font-medium text-white transition hover:bg-[#222222]",
          triggerClassName
        )}
      >
        <Plus className="h-4 w-4" strokeWidth={2.25} />
        {triggerLabel}
      </button>
      {panel}
    </>
  );
}
