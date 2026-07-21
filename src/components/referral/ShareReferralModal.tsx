"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import QRCode from "qrcode";
import { site } from "@/content/site";

const LOGO_SRC =
  "https://res.cloudinary.com/dxeoibunj/image/upload/v1778782058/editco_logo_transparent_no_watermark_cropped_reb8ht.png";

export function ShareReferralModal({
  open,
  onClose,
  code,
  fullName,
}: {
  open: boolean;
  onClose: () => void;
  code: string;
  fullName: string;
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const base = `${appUrl}/refer/${code}`;
  const [copied, setCopied] = useState(false);
  const [qr, setQr] = useState("");

  const directLink = useMemo(
    () =>
      `${base}?utm_source=referral&utm_medium=direct&utm_campaign=client_referral`,
    [base]
  );
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

  useEffect(() => {
    if (!open) return;
    QRCode.toDataURL(directLink, {
      margin: 1,
      width: 680,
      color: { dark: "#0a0a0a", light: "#ffffff" },
      errorCorrectionLevel: "M",
    }).then(setQr);
  }, [directLink, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "unset";
    };
  }, [open, onClose]);

  async function copyLink() {
    await navigator.clipboard.writeText(directLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  function downloadQr() {
    if (!qr) return;
    const a = document.createElement("a");
    a.href = qr;
    a.download = `${code}-referral-qr.png`;
    a.click();
  }

  const actions = [
    {
      label: copied ? "Copied" : "Copy link",
      onClick: copyLink,
    },
    {
      label: "WhatsApp",
      onClick: () =>
        window.open(
          `https://wa.me/?text=${encodeURIComponent(whatsappText)}`,
          "_blank",
          "noopener,noreferrer"
        ),
    },
    {
      label: "Email",
      onClick: () => {
        window.location.href = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
      },
    },
    {
      label: "Download QR",
      onClick: downloadQr,
      disabled: !qr,
    },
  ];

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{
            clipPath: "polygon(100% 0, 100% 0, 100% 0, 100% 0)",
          }}
          animate={{
            clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
          }}
          exit={{
            clipPath: "polygon(100% 0, 100% 0, 100% 0, 100% 0)",
          }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[250] overflow-y-auto bg-white p-6 text-black sm:p-8 md:p-16"
          role="dialog"
          aria-modal="true"
          aria-labelledby="share-overlay-title"
        >
          <div className="flex min-h-full flex-col">
            {/* One top row: logo + QR/text | close + socials */}
            <div className="flex items-start justify-between gap-6">
              <div className="flex min-w-0 flex-1 flex-wrap items-start gap-10 sm:gap-16 md:gap-24 lg:gap-32">
                <div className="flex h-12 shrink-0 items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={LOGO_SRC}
                    alt="Editco"
                    className="h-10 w-auto brightness-0 md:h-12"
                  />
                  <span className="font-inter text-xl font-semibold uppercase tracking-tighter text-black sm:text-2xl">
                    {site.name}
                  </span>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35, duration: 0.4 }}
                  className="mt-8 ml-4 flex flex-col gap-2 sm:mt-10 sm:ml-8 md:mt-12 md:ml-12 lg:ml-16"
                >
                  <div className="flex items-center gap-7 sm:gap-9 md:gap-12">
                    <div className="h-[11.5rem] w-[11.5rem] shrink-0 border border-black/10 bg-white p-2.5 sm:h-[13.5rem] sm:w-[13.5rem] md:h-[15.5rem] md:w-[15.5rem]">
                      {qr ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={qr}
                          alt="Referral QR code"
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <div className="h-full w-full animate-pulse bg-neutral-100" />
                      )}
                    </div>

                    <nav
                      id="share-overlay-title"
                      className="flex h-[11.5rem] flex-col justify-center gap-2 sm:h-[13.5rem] sm:gap-2.5 md:h-[15.5rem] md:gap-3"
                      aria-label="Share options"
                    >
                      {actions.map((action, i) => (
                        <motion.button
                          key={action.label}
                          type="button"
                          disabled={action.disabled}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 + i * 0.04, duration: 0.3 }}
                          onClick={action.onClick}
                          className="w-fit text-left font-inter text-[clamp(1.75rem,3.8vw,2.85rem)] font-medium leading-none tracking-tight text-black transition-opacity hover:opacity-50 disabled:opacity-30"
                        >
                          {action.label}
                        </motion.button>
                      ))}
                    </nav>
                  </div>
                  <p className="font-inter text-xs tracking-wide text-black/40 sm:text-sm">
                    {code}
                  </p>
                </motion.div>
              </div>

              <div className="flex shrink-0 flex-col items-end gap-8 sm:gap-12">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-white transition-transform hover:scale-110 active:scale-95"
                  aria-label="Close share menu"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>

                <div className="hidden flex-col items-end gap-2 text-right sm:flex">
                  <a
                    href={site.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-inter text-lg font-medium text-black transition-opacity hover:opacity-50"
                  >
                    Instagram
                  </a>
                  <a
                    href={site.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-inter text-lg font-medium text-black transition-opacity hover:opacity-50"
                  >
                    LinkedIn
                  </a>
                  <a
                    href={`mailto:${site.email}`}
                    className="font-inter text-lg font-medium text-black transition-opacity hover:opacity-50"
                  >
                    Email
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-2 sm:hidden">
              <a
                href={site.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="font-inter text-base font-medium text-black transition-opacity hover:opacity-50"
              >
                Instagram
              </a>
              <a
                href={site.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="font-inter text-base font-medium text-black transition-opacity hover:opacity-50"
              >
                LinkedIn
              </a>
              <a
                href={`mailto:${site.email}`}
                className="font-inter text-base font-medium text-black transition-opacity hover:opacity-50"
              >
                Email
              </a>
            </div>

            <div className="mt-auto hidden pt-16 text-right text-[10px] font-bold uppercase tracking-widest text-black/40 md:block">
              <p>© 2026 {site.name.toUpperCase()}</p>
              <p>HYDERABAD, INDIA</p>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
