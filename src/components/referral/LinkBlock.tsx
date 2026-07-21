"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { Button } from "@/components/referral/ui/button";
import {
  Check,
  Copy,
  Download,
  ExternalLink,
  Link2,
  Mail,
  MessageCircle,
} from "lucide-react";

export function LinkBlock({
  code,
  fullName,
}: {
  code: string;
  fullName: string;
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const base = `${appUrl}/refer/${code}`;
  const [copied, setCopied] = useState<string | null>(null);
  const [qr, setQr] = useState("");
  const [preview, setPreview] = useState<"whatsapp" | "email" | null>(null);

  const whatsappLink = useMemo(
    () =>
      `${base}?utm_source=referral&utm_medium=whatsapp&utm_campaign=client_referral`,
    [base]
  );
  const emailLink = useMemo(
    () =>
      `${base}?utm_source=referral&utm_medium=email&utm_campaign=client_referral`,
    [base]
  );
  const directLink = useMemo(
    () =>
      `${base}?utm_source=referral&utm_medium=direct&utm_campaign=client_referral`,
    [base]
  );

  const whatsappText = useMemo(
    () =>
      `Hey! I've been working with Editco Media — they build websites, AI calling agents & CRM systems. Thought they might help you too. Here's my intro link: ${whatsappLink}`,
    [whatsappLink]
  );

  const emailSubject = "Introducing Editco Media";
  const emailBody = useMemo(
    () =>
      `Hi,\n\nI wanted to introduce you to Editco Media. They help clinics and businesses with websites, AI agents, and automations.\n\nYou can learn more here: ${emailLink}\n\n— ${fullName}`,
    [emailLink, fullName]
  );

  const channels = [
    {
      id: "whatsapp" as const,
      label: "WhatsApp",
      hint: "Send a ready-made intro message",
      icon: MessageCircle,
      accent: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600",
      primaryLabel: "Open WhatsApp",
      onPrimary: () => {
        window.open(
          `https://wa.me/?text=${encodeURIComponent(whatsappText)}`,
          "_blank",
          "noopener,noreferrer"
        );
      },
      copyValue: whatsappText,
      preview: whatsappText,
    },
    {
      id: "email" as const,
      label: "Email",
      hint: "Open your mail app with the draft",
      icon: Mail,
      accent: "border-sky-500/30 bg-sky-500/10 text-sky-600",
      primaryLabel: "Compose email",
      onPrimary: () => {
        window.location.href = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
      },
      copyValue: emailBody,
      preview: emailBody,
    },
    {
      id: "direct" as const,
      label: "Copy link",
      hint: "Paste anywhere — chat, bio, or DM",
      icon: Link2,
      accent:
        "border-[var(--dash-accent)]/30 bg-[var(--dash-accent-soft)] text-[var(--dash-accent)]",
      primaryLabel: "Copy link",
      onPrimary: () => copy("direct", directLink),
      copyValue: directLink,
      preview: null,
    },
  ];

  useEffect(() => {
    QRCode.toDataURL(directLink, {
      margin: 2,
      width: 320,
      color: { dark: "#0a0a0a", light: "#ffffff" },
      errorCorrectionLevel: "M",
    }).then(setQr);
  }, [directLink]);

  async function copy(id: string, value: string) {
    await navigator.clipboard.writeText(value);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  }

  function downloadQr() {
    if (!qr) return;
    const a = document.createElement("a");
    a.href = qr;
    a.download = `${code}-referral-qr.png`;
    a.click();
  }

  const activePreview = channels.find((c) => c.id === preview);

  return (
    <section className="overflow-hidden rounded-[24px] border border-[var(--dash-border)] bg-[var(--dash-surface)]">
      <div className="grid lg:grid-cols-[1.2fr_auto]">
        <div className="flex flex-col justify-between border-b border-[var(--dash-border)] p-5 sm:p-6 lg:border-b-0 lg:border-r">
          <div>
            <div className="flex items-center gap-2 text-[var(--dash-accent)]">
              <Link2 className="h-4 w-4" />
              <p className="font-archivo text-[10px] uppercase tracking-[0.18em]">
                Your referral link
              </p>
            </div>
            <p className="mt-3 font-archivo text-3xl uppercase tracking-wide text-[var(--dash-text)]">
              {code}
            </p>
            <p className="mt-2 break-all font-inter text-xs leading-relaxed text-[var(--dash-muted)] sm:text-sm">
              {directLink}
            </p>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              onClick={() => copy("link", directLink)}
            >
              {copied === "link" ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copied === "link" ? "Copied" : "Copy link"}
            </Button>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-3 bg-[var(--dash-surface-strong)] px-6 py-6 lg:px-8">
          <p className="font-archivo text-[10px] uppercase tracking-[0.18em] text-[var(--dash-faint)]">
            Scan to share
          </p>
          <div className="rounded-2xl border border-[var(--dash-border)] bg-white p-3 shadow-[var(--dash-shadow)]">
            {qr ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qr}
                alt="Referral QR code"
                className="h-[168px] w-[168px] sm:h-[184px] sm:w-[184px]"
              />
            ) : (
              <div className="h-[168px] w-[168px] animate-pulse rounded-lg bg-neutral-200 sm:h-[184px] sm:w-[184px]" />
            )}
          </div>
          <button
            type="button"
            onClick={downloadQr}
            disabled={!qr}
            className="inline-flex items-center gap-1.5 font-archivo text-[10px] uppercase tracking-widest text-[var(--dash-muted)] transition hover:text-[var(--dash-accent)] disabled:opacity-40"
          >
            <Download className="h-3.5 w-3.5" />
            Download QR
          </button>
        </div>
      </div>

      <div className="border-t border-[var(--dash-border)] p-5 sm:p-6">
        <div className="mb-4">
          <p className="font-archivo text-[10px] uppercase tracking-[0.16em] text-[var(--dash-faint)]">
            Share faster
          </p>
          <p className="mt-1 font-inter text-sm text-[var(--dash-muted)]">
            One tap to open WhatsApp, email, or copy your link
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {channels.map((channel) => {
            const Icon = channel.icon;
            const isCopied = copied === channel.id;
            return (
              <div
                key={channel.id}
                className="group flex flex-col rounded-[20px] border border-[var(--dash-border)] bg-[var(--dash-hover)] p-4 transition hover:border-[var(--dash-accent)]/35"
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${channel.accent}`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-archivo text-sm uppercase tracking-wide text-[var(--dash-text)]">
                      {channel.label}
                    </p>
                    <p className="mt-0.5 font-inter text-xs text-[var(--dash-muted)]">
                      {channel.hint}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-1 flex-col gap-2">
                  <button
                    type="button"
                    onClick={channel.onPrimary}
                    className="dash-cta inline-flex h-10 w-full items-center justify-center gap-2 rounded-full font-archivo text-[10px] uppercase tracking-widest transition"
                  >
                    {channel.id === "direct" && isCopied ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        Copied
                      </>
                    ) : (
                      <>
                        {channel.id === "direct" ? (
                          <Copy className="h-3.5 w-3.5" />
                        ) : (
                          <ExternalLink className="h-3.5 w-3.5" />
                        )}
                        {channel.primaryLabel}
                      </>
                    )}
                  </button>

                  {channel.id !== "direct" ? (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => copy(channel.id, channel.copyValue)}
                        className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full border border-[var(--dash-border)] font-archivo text-[10px] uppercase tracking-widest text-[var(--dash-muted)] transition hover:border-[var(--dash-accent)]/40 hover:text-[var(--dash-text)]"
                      >
                        {isCopied ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                        {isCopied ? "Copied" : "Copy"}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setPreview((p) =>
                            p === channel.id ? null : channel.id
                          )
                        }
                        className="inline-flex h-9 items-center justify-center rounded-full border border-[var(--dash-border)] font-archivo text-[10px] uppercase tracking-widest text-[var(--dash-muted)] transition hover:border-[var(--dash-accent)]/40 hover:text-[var(--dash-text)]"
                      >
                        {preview === channel.id ? "Hide" : "Preview"}
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        {activePreview?.preview && (
          <div className="mt-4 rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-hover)] p-4">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="font-archivo text-[10px] uppercase tracking-[0.16em] text-[var(--dash-faint)]">
                {activePreview.label} message preview
              </p>
              <button
                type="button"
                onClick={() => setPreview(null)}
                className="font-archivo text-[10px] uppercase tracking-widest text-[var(--dash-faint)] transition hover:text-[var(--dash-text)]"
              >
                Close
              </button>
            </div>
            <p className="whitespace-pre-wrap font-inter text-sm leading-relaxed text-[var(--dash-muted)]">
              {activePreview.preview}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
