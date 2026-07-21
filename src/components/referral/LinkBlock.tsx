"use client";

import { useMemo, useState, useEffect } from "react";
import QRCode from "qrcode";
import { Button } from "@/components/referral/ui/button";
import { Check, Copy, Link2 } from "lucide-react";
import { motion } from "framer-motion";

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
  const [qr, setQr] = useState<string>("");

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

  const templates = [
    {
      id: "whatsapp",
      label: "WhatsApp",
      text: `Hey! I've been working with Editco Media — they build websites, AI calling agents & CRM systems. Thought they might help you too. Here's my intro link: ${whatsappLink}`,
    },
    {
      id: "email",
      label: "Email",
      text: `Hi,\n\nI wanted to introduce you to Editco Media. They help clinics and businesses with websites, AI agents, and automations.\n\nYou can learn more here: ${emailLink}\n\n— ${fullName}`,
    },
    {
      id: "direct",
      label: "Direct link",
      text: directLink,
    },
  ];

  useEffect(() => {
    QRCode.toDataURL(directLink, { margin: 1, width: 180, color: { dark: "#0a0a0a", light: "#ffffff" } }).then(setQr);
  }, [directLink]);

  async function copy(id: string, value: string) {
    await navigator.clipboard.writeText(value);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-gaude-orange/15 via-white/[0.03] to-transparent p-5 sm:p-6"
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-gaude-orange">
            <Link2 className="h-4 w-4" />
            <p className="font-archivo text-xs uppercase tracking-[0.16em]">
              Your referral link
            </p>
          </div>
          <p className="mt-3 font-archivo text-3xl uppercase tracking-wide text-white">
            {code}
          </p>
          <p className="mt-2 break-all text-sm text-neutral-400">{directLink}</p>
          <div className="mt-4 flex flex-wrap gap-2">
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
              Copy link
            </Button>
          </div>
        </div>
        {qr && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={qr}
            alt="Referral QR code"
            className="h-[140px] w-[140px] rounded-2xl border border-white/10 bg-white p-2 shadow-[0_0_30px_rgba(255,78,0,0.15)]"
          />
        )}
      </div>

      <div className="mt-6 space-y-3 border-t border-white/10 pt-5">
        <p className="font-archivo text-xs uppercase tracking-[0.14em] text-neutral-300">
          Share templates
        </p>
        {templates.map((t) => (
          <div
            key={t.id}
            className="rounded-2xl border border-white/10 bg-black/30 p-3 transition hover:border-gaude-orange/30"
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-xs uppercase tracking-wide text-neutral-500">
                {t.label}
              </span>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => copy(t.id, t.text)}
              >
                {copied === t.id ? "Copied" : "Copy"}
              </Button>
            </div>
            <p className="whitespace-pre-wrap text-sm text-neutral-400">
              {t.text}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
