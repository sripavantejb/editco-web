"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/referral/ui/input";
import { Label } from "@/components/referral/ui/label";
import { cn } from "@/lib/utils";

export const PHONE_DIAL_CODES = [
  { code: "+91", label: "🇮🇳 +91" },
  { code: "+1", label: "🇺🇸 +1" },
  { code: "+44", label: "🇬🇧 +44" },
  { code: "+971", label: "🇦🇪 +971" },
  { code: "+65", label: "🇸🇬 +65" },
  { code: "+61", label: "🇦🇺 +61" },
  { code: "+49", label: "🇩🇪 +49" },
  { code: "+81", label: "🇯🇵 +81" },
] as const;

function splitPhone(value?: string) {
  const raw = (value || "").trim();
  if (!raw) return { dial: "+91", local: "" };
  const match = PHONE_DIAL_CODES.find((d) => raw.startsWith(d.code));
  if (match) {
    return {
      dial: match.code,
      local: raw.slice(match.code.length).replace(/^[\s\-]+/, ""),
    };
  }
  if (raw.startsWith("+")) {
    const digits = raw.replace(/\D/g, "");
    return { dial: "+91", local: digits.replace(/^91/, "") };
  }
  return { dial: "+91", local: raw.replace(/\D/g, "") };
}

export function PhoneField({
  name,
  id,
  label = "Phone",
  required = false,
  defaultValue,
  className,
  inputClassName,
  selectClassName,
}: {
  name: string;
  id?: string;
  label?: string;
  required?: boolean;
  defaultValue?: string;
  className?: string;
  inputClassName?: string;
  selectClassName?: string;
}) {
  const initial = useMemo(() => splitPhone(defaultValue), [defaultValue]);
  const [dial, setDial] = useState(initial.dial);
  const [local, setLocal] = useState(initial.local);

  const combined = local.trim()
    ? `${dial}${local.replace(/\D/g, "")}`
    : "";

  return (
    <div className={cn("space-y-1.5", className)}>
      {label ? <Label htmlFor={id || name}>{label}</Label> : null}
      <div className="flex gap-2">
        <select
          aria-label="Country code"
          value={dial}
          onChange={(e) => setDial(e.target.value)}
          className={cn(
            "h-11 shrink-0 rounded-xl border border-[var(--dash-border,rgba(255,255,255,0.1))] bg-[var(--dash-input,rgba(255,255,255,0.05))] px-2.5 text-sm text-[var(--dash-text,#fff)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gaude-orange",
            selectClassName
          )}
        >
          {PHONE_DIAL_CODES.map((d) => (
            <option key={d.code} value={d.code} className="bg-gaude-black">
              {d.label}
            </option>
          ))}
        </select>
        <Input
          id={id || name}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          required={required}
          placeholder="98xxxxxxx"
          value={local}
          onChange={(e) => setLocal(e.target.value)}
          className={cn("min-w-0 flex-1", inputClassName)}
        />
      </div>
      <input type="hidden" name={name} value={combined} />
    </div>
  );
}
