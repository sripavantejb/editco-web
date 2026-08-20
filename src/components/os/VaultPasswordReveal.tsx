"use client";

import { useEffect, useState, useTransition } from "react";
import { revealVaultPassword } from "@/actions/os/vault-projects";

export function VaultPasswordReveal({
  projectId,
  hasPassword,
  canReveal,
}: {
  projectId: string;
  hasPassword: boolean;
  canReveal: boolean;
}) {
  const [plain, setPlain] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!plain) return;
    const t = setTimeout(() => setPlain(null), 15000);
    return () => clearTimeout(t);
  }, [plain]);

  if (!hasPassword) {
    return (
      <span className="font-inter text-sm text-[var(--dash-muted)]">
        Not configured
      </span>
    );
  }

  if (!canReveal) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <code className="font-mono text-sm text-[var(--dash-text)]">
          ••••••••••••
        </code>
        <span className="font-inter text-xs text-[var(--dash-muted)]">
          No credential access
        </span>
      </div>
    );
  }

  function onReveal() {
    setError(null);
    if (plain) {
      setPlain(null);
      return;
    }
    startTransition(async () => {
      const res = await revealVaultPassword(projectId);
      if (res.error || !res.password) {
        setError(res.error || "Failed to reveal");
        return;
      }
      setPlain(res.password);
    });
  }

  function onCopy() {
    setError(null);
    startTransition(async () => {
      let value = plain;
      if (!value) {
        const res = await revealVaultPassword(projectId);
        if (res.error || !res.password) {
          setError(res.error || "Failed to copy");
          return;
        }
        value = res.password;
        setPlain(value);
      }
      try {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        setError("Clipboard unavailable");
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <code className="font-mono text-sm text-[var(--dash-text)]">
        {plain || "••••••••••••"}
      </code>
      <button
        type="button"
        onClick={onReveal}
        disabled={pending}
        className="inline-flex min-h-8 items-center rounded-full border border-[var(--dash-border)] px-3 font-archivo text-[10px] uppercase tracking-[0.08em] text-[var(--dash-text)] hover:border-[var(--dash-accent)] hover:text-[var(--dash-accent)] disabled:opacity-50"
      >
        {pending && !plain ? "…" : plain ? "Hide" : "Reveal"}
      </button>
      <button
        type="button"
        onClick={onCopy}
        disabled={pending}
        className="inline-flex min-h-8 items-center rounded-full border border-[var(--dash-border)] px-3 font-archivo text-[10px] uppercase tracking-[0.08em] text-[var(--dash-text)] hover:border-[var(--dash-accent)] hover:text-[var(--dash-accent)] disabled:opacity-50"
      >
        {copied ? "Copied" : "Copy"}
      </button>
      {error ? (
        <span className="font-inter text-xs text-red-400">{error}</span>
      ) : null}
    </div>
  );
}
