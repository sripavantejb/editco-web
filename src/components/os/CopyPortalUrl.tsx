"use client";

import { useState } from "react";

export function CopyPortalUrl({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="max-w-full break-all font-inter text-xs text-[var(--dash-accent)]"
      >
        {url}
      </a>
      <button
        type="button"
        onClick={copy}
        className="shrink-0 rounded-lg border border-[var(--dash-border)] px-2 py-1 font-inter text-[11px] text-[var(--dash-muted)] hover:text-[var(--dash-text)]"
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
