"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";

function CopyButton({
  value,
  label = "Copy",
  tone = "light",
}: {
  value: string;
  label?: string;
  tone?: "light" | "dark";
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={
        tone === "dark"
          ? "inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-white/15 px-2.5 py-1.5 font-inter text-[11px] text-white/60 transition-colors hover:border-white/30 hover:text-white"
          : "inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#e5e7eb] px-2.5 py-1.5 font-inter text-[11px] text-[#6b7280] transition-colors hover:border-[#111111] hover:text-[#111111]"
      }
    >
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {copied ? "Copied" : label}
    </button>
  );
}

/**
 * The tracking code as a tear-off ticket. Sits inside the dark hero, so every
 * colour here is hard-coded rather than themed.
 */
export function TrackingTicket({
  code,
  trackUrl,
  clientEmail,
}: {
  code: string;
  trackUrl: string;
  clientEmail?: string;
}) {
  const message = [
    `Your Editco project is live — you can track it any time.`,
    ``,
    `Tracking code: ${code}`,
    `Track here: ${trackUrl}`,
    ``,
    `Enter the code to see every stage, deliverable and payment as it happens.`,
    `Please keep the code private — anyone who has it can view the project.`,
  ].join("\n");

  return (
    <div className="relative w-full shrink-0 overflow-hidden rounded-2xl border border-white/12 bg-white/[0.04] sm:w-[310px]">
      {/* perforation */}
      <span
        aria-hidden
        className="absolute -left-2 top-[86px] h-4 w-4 rounded-full bg-[#0d0d0d]"
      />
      <span
        aria-hidden
        className="absolute -right-2 top-[86px] h-4 w-4 rounded-full bg-[#0d0d0d]"
      />

      <div className="p-5 pb-4">
        <p className="font-archivo text-[10px] uppercase tracking-[0.2em] text-white/40">
          Client tracking code
        </p>
        <p className="mt-2.5 font-mono text-[26px] leading-none tracking-[0.12em] text-white">
          {code}
        </p>
      </div>

      <div
        aria-hidden
        className="mx-4 border-t border-dashed border-white/15"
        style={{ marginTop: 6 }}
      />

      <div className="space-y-3 p-5 pt-4">
        <div className="flex flex-wrap items-center gap-2">
          <CopyButton value={code} label="Copy code" tone="dark" />
          <CopyButton value={message} label="Copy message" tone="dark" />
        </div>
        <a
          href={trackUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex max-w-full items-center gap-1.5 break-all font-inter text-[11px] text-white/50 transition-colors hover:text-white"
        >
          {trackUrl}
          <ExternalLink className="h-3 w-3 shrink-0" />
        </a>
        <p className="font-inter text-[11px] leading-relaxed text-white/35">
          The code is the only credential — anyone holding it can open this
          project. Send it only to {clientEmail || "the client"}.
        </p>
      </div>
    </div>
  );
}
