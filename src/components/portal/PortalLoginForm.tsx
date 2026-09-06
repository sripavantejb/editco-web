"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { ArrowRight, Lock, Mail } from "lucide-react";
import { adminLogin, type ActionState } from "@/actions/auth";

const initial: ActionState = {};

export type PortalKind = "os" | "sales_admin" | "sales_employee";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#111111] px-4 font-inter text-sm font-semibold text-white transition hover:bg-[#242424] disabled:bg-[#e5e7eb] disabled:text-[#6b7280]"
    >
      {pending ? "Signing in…" : label}
      {!pending ? <ArrowRight className="h-4 w-4" /> : null}
    </button>
  );
}

function footerFor(portal: PortalKind) {
  if (portal === "os") {
    return (
      <>
        Sales Admin?{" "}
        <Link href="/sales/login/admin" className="font-semibold text-[#111111] underline underline-offset-2">
          Sign in here
        </Link>
      </>
    );
  }
  if (portal === "sales_admin") {
    return (
      <>
        Super Admin?{" "}
        <Link href="/admin/login" className="font-semibold text-[#111111] underline underline-offset-2">
          Sign in here
        </Link>
      </>
    );
  }
  // Employee portal — no admin links (admins use direct URLs).
  return null;
}

export function PortalLoginForm({
  portal,
  next,
  submitLabel,
}: {
  portal: PortalKind;
  next?: string;
  submitLabel: string;
}) {
  const [state, action] = useActionState(adminLogin, initial);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="portal" value={portal} />
      {next ? <input type="hidden" name="next" value={next} /> : null}

      <div className="space-y-1.5">
        <label htmlFor="email" className="block font-inter text-sm font-semibold text-[#111111]">
          Email address
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#898989]" />
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="you@company.com"
            className="h-11 w-full rounded-lg border border-[#e5e7eb] bg-white pl-10 pr-3 font-inter text-sm text-[#111111] outline-none placeholder:text-[#898989] focus:border-[#111111]"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="block font-inter text-sm font-semibold text-[#111111]">
          Password
        </label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#898989]" />
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="Enter your password"
            className="h-11 w-full rounded-lg border border-[#e5e7eb] bg-white pl-10 pr-3 font-inter text-sm text-[#111111] outline-none placeholder:text-[#898989] focus:border-[#111111]"
          />
        </div>
      </div>

      {state.error ? (
        <p className="font-inter text-sm text-[#ef4444]">{state.error}</p>
      ) : null}

      <Submit label={submitLabel} />

      {(() => {
        const footer = footerFor(portal);
        return footer ? (
          <p className="pt-1 text-center font-inter text-[13px] text-[#6b7280]">{footer}</p>
        ) : null;
      })()}
    </form>
  );
}
