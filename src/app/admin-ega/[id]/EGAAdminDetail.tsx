"use client";

import { useActionState, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import type { EGADetail } from "@/actions/ega";
import { updateEGAProfile, updateEGAStatus } from "@/actions/ega";
import type { ActionState } from "@/actions/auth";
import {
  EGA_STATUS_LABELS,
  SCORE_BREAKDOWN_LABELS,
  SCORE_BREAKDOWN_MAX,
  SPECIALIZATION_OPTIONS,
  YEAR_OPTIONS,
  egaEmailTemplate,
  egaWhatsAppTemplate,
  egaWhatsAppUrl,
  type EGAOutreachKind,
  type EGAScoreBreakdown,
  type EGAStatus,
} from "@/lib/ega";
import { formatDateTime } from "@/lib/utils";
import { openGmailCompose } from "@/lib/gmail";
import { Card } from "@/components/referral/ui/card";
import { ScoreBadge, StatusBadge } from "../EGAAdminList";

function kindFromStatus(status: EGAStatus): EGAOutreachKind {
  if (status === "rejected") return "rejected";
  if (status === "lookback") return "lookback";
  return "selected";
}

export function EGAAdminDetail({ app }: { app: EGADetail }) {
  const [status, setStatus] = useState(app.status);
  const [pendingStatus, startStatus] = useTransition();
  const [saveState, saveAction, saving] = useActionState<ActionState, FormData>(
    updateEGAProfile,
    {}
  );
  const [profile, setProfile] = useState({
    fullName: app.fullName,
    email: app.email,
    phone: app.phone,
    college: app.college,
    city: app.city,
    yearOfStudy: app.yearOfStudy,
    specialization: app.specialization,
    linkedin: app.linkedin,
  });

  const setField =
    (key: keyof typeof profile) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setProfile((p) => ({ ...p, [key]: e.target.value }));
    };

  const onStatusChange = (next: EGAStatus) => {
    setStatus(next);
    startStatus(async () => {
      const res = await updateEGAStatus(app.id, next);
      if (res.error) setStatus(app.status);
    });
  };

  const kind = kindFromStatus(status);
  const emailTpl = useMemo(
    () => egaEmailTemplate(kind, profile.fullName),
    [kind, profile.fullName]
  );
  const waTpl = useMemo(
    () => egaWhatsAppTemplate(kind, profile.fullName),
    [kind, profile.fullName]
  );

  const breakdown = app.scoreBreakdown || ({} as EGAScoreBreakdown);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-archivo text-[10px] uppercase tracking-[0.2em] text-[var(--dash-accent)]">
            Growth Associate
          </p>
          <h1 className="mt-1 font-archivo text-2xl uppercase tracking-tighter text-[var(--dash-text)] sm:text-3xl">
            {profile.fullName}
          </h1>
          <p className="mt-1 text-sm text-[var(--dash-muted)]">
            {profile.college}
            {profile.city ? ` · ${profile.city}` : ""} · {formatDateTime(app.createdAt)}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <span className="text-sm text-[var(--dash-muted)]">{profile.email}</span>
            <span className="text-sm text-[var(--dash-muted)]">{profile.phone}</span>
            <ScoreBadge score={app.score} />
            <StatusBadge status={status} />
          </div>
        </div>
        <Link
          href="/admin-ega"
          className="inline-flex h-9 items-center justify-center rounded-full border border-[var(--dash-border)] px-4 font-archivo text-xs uppercase tracking-[0.08em] text-[var(--dash-text)] transition hover:bg-[var(--dash-hover)]"
        >
          All applications
        </Link>
      </div>

      <Card className="space-y-4">
        <p className="font-archivo text-[10px] uppercase tracking-[0.16em] text-[var(--dash-accent)]">
          Snapshot
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Answer label="Knows owners" value={app.knowsOwners} />
          <Answer label="Network size" value={app.networkSize} />
          <Answer label="Weekly hours" value={app.weeklyHours} />
          <Answer label="Duration" value={app.duration} />
        </div>
        <Answer label="About" value={app.about} />
        <Answer label="Why select you" value={app.whySelect} />
        <Answer
          label='"We already have a website"'
          value={app.websiteObjection}
        />
        <Answer label="17 of 20 rejected" value={app.rejectionResponse} />
      </Card>

      <Card className="space-y-4">
        <div>
          <p className="font-archivo text-[10px] uppercase tracking-[0.16em] text-[var(--dash-accent)]">
            Profile
          </p>
          <p className="mt-1 text-sm text-[var(--dash-muted)]">
            Edit contact details, then save. Email and WhatsApp will use the
            updated values.
          </p>
        </div>
        <form action={saveAction} className="space-y-4">
          <input type="hidden" name="id" value={app.id} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label="Full name"
              name="fullName"
              value={profile.fullName}
              onChange={setField("fullName")}
            />
            <Field
              label="Email"
              name="email"
              type="email"
              value={profile.email}
              onChange={setField("email")}
            />
            <Field
              label="Phone / WhatsApp"
              name="phone"
              value={profile.phone}
              onChange={setField("phone")}
            />
            <Field
              label="College"
              name="college"
              value={profile.college}
              onChange={setField("college")}
            />
            <Field
              label="City"
              name="city"
              value={profile.city}
              onChange={setField("city")}
            />
            <label className="block text-sm">
              <span className="mb-1.5 block text-[var(--dash-muted)]">
                Year of study
              </span>
              <select
                name="yearOfStudy"
                value={profile.yearOfStudy}
                onChange={setField("yearOfStudy")}
                className="flex h-11 w-full rounded-xl border border-[var(--dash-border)] bg-[var(--dash-input)] px-3 text-sm text-[var(--dash-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dash-accent)]"
              >
                {[
                  ...YEAR_OPTIONS,
                  ...(YEAR_OPTIONS as readonly string[]).includes(
                    profile.yearOfStudy
                  )
                    ? []
                    : [profile.yearOfStudy],
                ].map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block text-[var(--dash-muted)]">
                Specialization
              </span>
              <select
                name="specialization"
                value={profile.specialization}
                onChange={setField("specialization")}
                className="flex h-11 w-full rounded-xl border border-[var(--dash-border)] bg-[var(--dash-input)] px-3 text-sm text-[var(--dash-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dash-accent)]"
              >
                {[
                  ...SPECIALIZATION_OPTIONS,
                  ...(SPECIALIZATION_OPTIONS as readonly string[]).includes(
                    profile.specialization
                  )
                    ? []
                    : [profile.specialization],
                ].map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </label>
            <Field
              label="LinkedIn"
              name="linkedin"
              value={profile.linkedin}
              onChange={setField("linkedin")}
            />
          </div>
          {saveState.error ? (
            <p className="text-sm text-red-300">{saveState.error}</p>
          ) : null}
          {saveState.success ? (
            <p className="text-sm text-emerald-300">{saveState.success}</p>
          ) : null}
          <button
            type="submit"
            disabled={saving}
            className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--dash-accent)] px-6 font-archivo text-xs uppercase tracking-[0.08em] text-[var(--dash-on-accent)] disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save profile"}
          </button>
        </form>
      </Card>

      <Card className="space-y-4">
        <div>
          <p className="font-archivo text-[10px] uppercase tracking-[0.16em] text-[var(--dash-accent)]">
            Decision
          </p>
          <p className="mt-1 text-sm text-[var(--dash-muted)]">
            Set the outcome. The email and WhatsApp templates load automatically.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(["selected", "lookback", "rejected", "pending"] as EGAStatus[]).map(
            (s) => (
              <button
                key={s}
                type="button"
                disabled={pendingStatus}
                onClick={() => onStatusChange(s)}
                className={`inline-flex h-10 items-center rounded-full px-4 font-archivo text-[11px] uppercase tracking-[0.08em] transition disabled:opacity-50 ${
                  status === s
                    ? "bg-[var(--dash-accent)] text-[var(--dash-on-accent)]"
                    : "border border-[var(--dash-border)] text-[var(--dash-muted)] hover:text-[var(--dash-text)]"
                }`}
              >
                {EGA_STATUS_LABELS[s]}
              </button>
            )
          )}
        </div>
      </Card>

      {status !== "pending" ? (
        <Card className="space-y-4">
          <div>
            <p className="font-archivo text-[10px] uppercase tracking-[0.16em] text-[var(--dash-accent)]">
              Reach out
            </p>
            <p className="mt-1 text-sm text-[var(--dash-muted)]">
              Template is ready for{" "}
              <strong className="text-[var(--dash-text)]">
                {EGA_STATUS_LABELS[status]}
              </strong>
              . Open it, check the message, then send.
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-[var(--dash-border)] bg-black/20 p-4">
              <p className="font-archivo text-[10px] uppercase tracking-[0.14em] text-[var(--dash-faint)]">
                Email · {profile.email}
              </p>
              <p className="mt-2 text-sm font-medium text-[var(--dash-text)]">
                {emailTpl.subject}
              </p>
              <pre className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap font-inter text-xs leading-relaxed text-[var(--dash-muted)]">
                {emailTpl.body}
              </pre>
              <button
                type="button"
                onClick={() =>
                  openGmailCompose({
                    to: profile.email,
                    subject: emailTpl.subject,
                    body: emailTpl.body,
                  })
                }
                className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-full bg-[var(--dash-accent)] px-4 font-archivo text-[11px] uppercase tracking-[0.08em] text-[var(--dash-on-accent)]"
              >
                Open email template
              </button>
            </div>

            <div className="rounded-xl border border-[var(--dash-border)] bg-black/20 p-4">
              <p className="font-archivo text-[10px] uppercase tracking-[0.14em] text-[var(--dash-faint)]">
                WhatsApp · {profile.phone}
              </p>
              <pre className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap font-inter text-xs leading-relaxed text-[var(--dash-muted)]">
                {waTpl}
              </pre>
              <a
                href={egaWhatsAppUrl(profile.phone, waTpl)}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-full border border-[var(--dash-accent)] px-4 font-archivo text-[11px] uppercase tracking-[0.08em] text-[var(--dash-accent)]"
              >
                Open WhatsApp template
              </a>
            </div>
          </div>
        </Card>
      ) : (
        <p className="text-sm text-[var(--dash-muted)]">
          Choose Selected, Lookback, or Rejected to load the matching message
          templates.
        </p>
      )}

      <Card>
        <h2 className="font-archivo text-sm uppercase tracking-wide text-[var(--dash-text)]">
          Fit signal · {app.score} / 100
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {(Object.keys(SCORE_BREAKDOWN_LABELS) as (keyof EGAScoreBreakdown)[]).map(
            (key) => {
              const value = Number(breakdown[key] ?? 0);
              const max = SCORE_BREAKDOWN_MAX[key];
              const pct = max ? Math.min(100, (value / max) * 100) : 0;
              return (
                <div key={key}>
                  <div className="flex justify-between text-xs text-[var(--dash-muted)]">
                    <span>{SCORE_BREAKDOWN_LABELS[key]}</span>
                    <span className="tabular-nums">
                      {value} / {max}
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-[var(--dash-accent)]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            }
          )}
        </div>
      </Card>

      <AnswerGroup title="About">
        <Answer label="Year of study" value={app.yearOfStudy} />
        <Answer label="Specialization" value={app.specialization} />
        <Answer label="About themselves" value={app.about} />
        <Answer label="Why Growth Associate" value={app.whyAssociate} />
        <Answer label="Interests" value={app.interests.join(", ")} />
      </AnswerGroup>

      <AnswerGroup title="Network">
        <Answer label="Knows business owners" value={app.knowsOwners} />
        <Answer label="Reachable owners" value={app.networkSize} />
        <Answer label="Industries" value={app.industries.join(", ")} />
        <Answer label="Network sources" value={app.networkSources.join(", ")} />
        <Answer label="Business types that could benefit" value={app.businessTypes} />
      </AnswerGroup>

      <AnswerGroup title="Sales & communication">
        <Answer label="Has sold before" value={app.soldBefore} />
        {app.salesExperience ? (
          <Answer label="Sales experience" value={app.salesExperience} />
        ) : null}
        <Answer label="Approaching strangers" value={`${app.comfortApproach} / 5`} />
        <Answer label="Cold calling" value={`${app.comfortColdCall} / 5`} />
        <Answer label="LinkedIn / Instagram outreach" value={`${app.comfortOutreach} / 5`} />
      </AnswerGroup>

      <AnswerGroup title="Business development thinking">
        <Answer label="Restaurant scenario" value={app.restaurantProblems} />
        <Answer label='"We already have a website"' value={app.websiteObjection} />
        <Answer label='"Too expensive"' value={app.expensiveObjection} />
        <Answer label="17 of 20 rejected" value={app.rejectionResponse} />
      </AnswerGroup>

      <AnswerGroup title="Editco & commitment">
        <Answer label="Services of interest" value={app.services.join(", ")} />
        <Answer label="Example business" value={app.exampleBusiness} />
        <Answer label="Weekly hours" value={app.weeklyHours} />
        <Answer label="Performance-based earnings" value={app.performanceBased} />
        <Answer label="Training / onboarding" value={app.training} />
        <Answer label="Duration" value={app.duration} />
      </AnswerGroup>

      <AnswerGroup title="Final pitch">
        <Answer label="Why select you" value={app.whySelect} />
        <Answer label="What they want to achieve" value={app.achievements} />
        <Answer
          label="LinkedIn"
          value={app.linkedin}
          href={app.linkedin || undefined}
        />
        <Answer label="Anything else" value={app.anythingElse} />
      </AnswerGroup>
    </div>
  );
}

function AnswerGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <h2 className="font-archivo text-sm uppercase tracking-wide text-[var(--dash-text)]">
        {title}
      </h2>
      {children}
    </div>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block text-[var(--dash-muted)]">{label}</span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="flex h-11 w-full rounded-xl border border-[var(--dash-border)] bg-[var(--dash-input)] px-3 text-sm text-[var(--dash-text)] placeholder:text-[var(--dash-faint)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dash-accent)]"
      />
    </label>
  );
}

function Answer({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) {
  if (!value?.trim()) return null;
  return (
    <Card className="space-y-1.5 p-4">
      <h3 className="text-sm font-medium text-[var(--dash-text)]">{label}</h3>
      {href ? (
        <a
          href={href.startsWith("http") ? href : `https://${href}`}
          target="_blank"
          rel="noreferrer"
          className="break-all text-sm text-[var(--dash-accent)] hover:underline"
        >
          {value}
        </a>
      ) : (
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--dash-muted)]">
          {value}
        </p>
      )}
    </Card>
  );
}
