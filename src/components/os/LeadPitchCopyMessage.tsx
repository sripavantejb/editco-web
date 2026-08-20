"use client";

import { useMemo, useState } from "react";
import { OsSelect } from "@/components/os/OsSelect";
import {
  VAULT_MESSAGE_TYPES,
  VAULT_MESSAGE_TYPE_LABELS,
  type VaultMessageType,
} from "@/lib/os/constants";
import { renderMessageTemplate } from "@/lib/os/message-template";

export function LeadPitchCopyMessage({
  leadName,
  leadCompany,
  leadPhone,
  senderName,
  projectName,
  projectWebsite,
  messages,
}: {
  leadName: string;
  leadCompany: string;
  leadPhone: string;
  senderName: string;
  projectName: string;
  projectWebsite?: string;
  messages: Partial<
    Record<string, { subject?: string; body?: string }>
  >;
}) {
  const [type, setType] = useState<VaultMessageType>("whatsapp_cold");
  const [copied, setCopied] = useState(false);

  const rendered = useMemo(() => {
    const msg = messages[type];
    const body = msg?.body || "";
    const subject = msg?.subject || "";
    const vars = {
      name: leadName,
      company: leadCompany,
      project_name: projectName,
      sender_name: senderName,
      phone: leadPhone,
      website: projectWebsite || "",
    };
    const renderedBody = renderMessageTemplate(body, vars);
    const renderedSubject = renderMessageTemplate(subject, vars);
    if (type === "email" && renderedSubject) {
      return `Subject: ${renderedSubject}\n\n${renderedBody}`;
    }
    return renderedBody;
  }, [
    type,
    messages,
    leadName,
    leadCompany,
    projectName,
    senderName,
    leadPhone,
    projectWebsite,
  ]);

  async function copy() {
    if (!rendered.trim()) return;
    try {
      await navigator.clipboard.writeText(rendered);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="space-y-2">
      <p className="font-archivo text-[10px] uppercase tracking-[0.08em] text-[var(--dash-muted)]">
        Copy message
      </p>
      <OsSelect
        value={type}
        onChange={(v) => setType(v as VaultMessageType)}
        options={VAULT_MESSAGE_TYPES.map((t) => ({
          value: t,
          label: VAULT_MESSAGE_TYPE_LABELS[t],
        }))}
      />
      <pre className="max-h-32 overflow-auto whitespace-pre-wrap rounded-xl border border-[var(--dash-border)] bg-[var(--dash-input)] p-3 font-inter text-xs text-[var(--dash-text)]">
        {rendered.trim() || "No template for this message type."}
      </pre>
      <button
        type="button"
        onClick={() => void copy()}
        disabled={!rendered.trim()}
        className="inline-flex min-h-8 items-center rounded-full border border-[var(--dash-border)] px-3 font-archivo text-[10px] uppercase tracking-[0.08em] disabled:opacity-40"
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
