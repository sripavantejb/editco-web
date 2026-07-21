"use client";

import { useEffect } from "react";
import { REF_COOKIE } from "@/lib/constants";

const DAYS = 90;

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

export function AttributionCapture({
  code,
  onCaptured,
}: {
  code: string;
  onCaptured?: () => void;
}) {
  useEffect(() => {
    const normalized = code.toUpperCase();
    setCookie(REF_COOKIE, normalized, DAYS);
    try {
      localStorage.setItem(REF_COOKIE, normalized);
    } catch {
      // ignore
    }
    onCaptured?.();
  }, [code, onCaptured]);

  return null;
}

export function readStoredReferralCode() {
  if (typeof document === "undefined") return "";
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${REF_COOKIE}=`));
  if (match) return decodeURIComponent(match.split("=")[1] || "");
  try {
    return localStorage.getItem(REF_COOKIE) || "";
  } catch {
    return "";
  }
}
