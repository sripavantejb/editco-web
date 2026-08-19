"use client";

import { useActionState, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import type { EGADetail } from "@/actions/ega";
import { updateEGAProfile, updateEGAStatus } from "@/actions/ega";
import type { ActionState } from "@/actions/auth";
import {
  DURATION_OPTIONS,
  EGA_STATUS_LABELS,
  INDUSTRY_OPTIONS,
  INTEREST_OPTIONS,
  NETWORK_SIZE_OPTIONS,
  NETWORK_SOURCE_OPTIONS,
  PERFORMANCE_OPTIONS,
  SCORE_BREAKDOWN_LABELS,
  SCORE_BREAKDOWN_MAX,
  SERVICE_OPTIONS,
  SPECIALIZATION_OPTIONS,
  WEEKLY_HOURS_OPTIONS,
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

function withCurrent(options: readonly string[], current: string) {
  return options.includes(current) ? [...options] : [...options, current].filter(Boolean);
}

export function EGAAdminDetail({ app }: { app: EGADetail }) {
  const [status, setStatus] = useState(app.status);
  const [pendingStatus, startStatus] = useTransition();
  const [saveState, saveAction, saving] = useActionState<ActionState, FormData>(
    updateEGAProfile,
    {}
  );
  const [form, setForm] = useState({
    fullName: app.fullName,
    email: app.email,
    phone: app.phone,
    college: app.college,
    city: app.city,
    yearOfStudy: app.yearOfStudy,
    specialization: app.specialization,
    linkedin: app.linkedin,
    about: app.about,
    whyAssociate: app.whyAssociate,
    interests: app.interests,
    knowsOwners: app.knowsOwners,
    networkSize: app.networkSize,
    industries: app.industries,
    networkSources: app.networkSources,
    businessTypes: app.businessTypes,
    soldBefore: app.soldBefore,
    salesExperience: app.salesExperience,
    comfortApproach: String(app.comfortApproach || 1),
    comfortColdCall: String(app.comfortColdCall || 1),
    comfortOutreach: String(app.comfortOutreach || 1),
    restaurantProblems: app.restaurantProblems,
    websiteObjection: app.websiteObjection,
    expensiveObjection: app.expensiveObjection,
    rejectionResponse: app.rejectionResponse,
    services: app.services,
    exampleBusiness: app.exampleBusiness,
    weeklyHours: app.weeklyHours,
    performanceBased: app.performanceBased,
    training: app.training,
    duration: app.duration,
    whySelect: app.whySelect,
    achievements: app.achievements,
    anythingElse: app.anythingElse,
  });

  const setText =
    (key: keyof typeof form) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ) => {
      setForm((p) => ({ ...p, [key]: e.target.value }));
    };

  const toggleMulti = (key: "interests" | "industries" | "networkSources" | "services", value: string, max?: number) => {
    setForm((p) => {
      const current = p[key];
      const has = current.includes(value);
      if (has) return { ...p, [key]: current.filter((v) => v !== value) };
      if (max && current.length >= max) return p;
      return { ...p, [key]: [...current, value] };
    });
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
    () => egaEmailTemplate(kind, form.fullName),
    [kind, form.fullName]
  );
  const waTpl = useMemo(
    () => egaWhatsAppTemplate(kind, form.fullName),
    [kind, form.fullName]
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
            {form.fullName}
          </h1>
          <p className="mt-1 text-sm text-[var(--dash-muted)]">
            {form.college}
            {form.city ? ` · ${form.city}` : ""} · {formatDateTime(app.createdAt)}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <span className="text-sm text-[var(--dash-muted)]">{form.email}</span>
            <span className="text-sm text-[var(--dash-muted)]">{form.phone}</span>
            <ScoreBadge score={app.score} />
            <StatusBadge status={status} />
          </div>
        </div>
        <Link
          href="/admin/ega"
          className="inline-flex h-9 items-center justify-center rounded-full border border-[var(--dash-border)] px-4 font-archivo text-xs uppercase tracking-[0.08em] text-[var(--dash-text)] transition hover:bg-[var(--dash-hover)]"
        >
          All applications
        </Link>
      </div>

      <form action={saveAction} className="space-y-6">
        <input type="hidden" name="id" value={app.id} />

        <Card className="space-y-4">
          <div>
            <p className="font-archivo text-[10px] uppercase tracking-[0.16em] text-[var(--dash-accent)]">
              Profile
            </p>
            <p className="mt-1 text-sm text-[var(--dash-muted)]">
              Edit any field, then save. Fit signal recalculates from the answers.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Full name" name="fullName" value={form.fullName} onChange={setText("fullName")} />
            <Field label="Email" name="email" type="email" value={form.email} onChange={setText("email")} />
            <Field label="Phone / WhatsApp" name="phone" value={form.phone} onChange={setText("phone")} />
            <Field label="College" name="college" value={form.college} onChange={setText("college")} />
            <Field label="City" name="city" value={form.city} onChange={setText("city")} />
            <SelectField
              label="Year of study"
              name="yearOfStudy"
              value={form.yearOfStudy}
              onChange={setText("yearOfStudy")}
              options={withCurrent(YEAR_OPTIONS, form.yearOfStudy)}
            />
            <SelectField
              label="Specialization"
              name="specialization"
              value={form.specialization}
              onChange={setText("specialization")}
              options={withCurrent(SPECIALIZATION_OPTIONS, form.specialization)}
            />
            <Field label="LinkedIn" name="linkedin" value={form.linkedin} onChange={setText("linkedin")} />
          </div>
        </Card>

        <Card className="space-y-4">
          <p className="font-archivo text-[10px] uppercase tracking-[0.16em] text-[var(--dash-accent)]">
            About
          </p>
          <AreaField label="About themselves" name="about" value={form.about} onChange={setText("about")} />
          <AreaField
            label="Why Growth Associate"
            name="whyAssociate"
            value={form.whyAssociate}
            onChange={setText("whyAssociate")}
          />
          <CheckGroup
            label="Interests (max 3)"
            name="interests"
            options={INTEREST_OPTIONS}
            extra={form.interests}
            selected={form.interests}
            onToggle={(v) => toggleMulti("interests", v, 3)}
          />
        </Card>

        <Card className="space-y-4">
          <p className="font-archivo text-[10px] uppercase tracking-[0.16em] text-[var(--dash-accent)]">
            Network
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <SelectField
              label="Knows business owners"
              name="knowsOwners"
              value={form.knowsOwners}
              onChange={setText("knowsOwners")}
              options={withCurrent(["Yes", "No"], form.knowsOwners)}
            />
            <SelectField
              label="Reachable owners"
              name="networkSize"
              value={form.networkSize}
              onChange={setText("networkSize")}
              options={withCurrent(NETWORK_SIZE_OPTIONS, form.networkSize)}
            />
          </div>
          <CheckGroup
            label="Industries"
            name="industries"
            options={INDUSTRY_OPTIONS}
            extra={form.industries}
            selected={form.industries}
            onToggle={(v) => toggleMulti("industries", v)}
          />
          <CheckGroup
            label="Network sources"
            name="networkSources"
            options={NETWORK_SOURCE_OPTIONS}
            extra={form.networkSources}
            selected={form.networkSources}
            onToggle={(v) => toggleMulti("networkSources", v)}
          />
          <AreaField
            label="Business types that could benefit"
            name="businessTypes"
            value={form.businessTypes}
            onChange={setText("businessTypes")}
          />
        </Card>

        <Card className="space-y-4">
          <p className="font-archivo text-[10px] uppercase tracking-[0.16em] text-[var(--dash-accent)]">
            Sales & communication
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <SelectField
              label="Has sold before"
              name="soldBefore"
              value={form.soldBefore}
              onChange={setText("soldBefore")}
              options={withCurrent(["Yes", "No"], form.soldBefore)}
            />
            <SelectField
              label="Approaching strangers"
              name="comfortApproach"
              value={form.comfortApproach}
              onChange={setText("comfortApproach")}
              options={["1", "2", "3", "4", "5"]}
            />
            <SelectField
              label="Cold calling"
              name="comfortColdCall"
              value={form.comfortColdCall}
              onChange={setText("comfortColdCall")}
              options={["1", "2", "3", "4", "5"]}
            />
            <SelectField
              label="LinkedIn / Instagram outreach"
              name="comfortOutreach"
              value={form.comfortOutreach}
              onChange={setText("comfortOutreach")}
              options={["1", "2", "3", "4", "5"]}
            />
          </div>
          <AreaField
            label="Sales experience"
            name="salesExperience"
            value={form.salesExperience}
            onChange={setText("salesExperience")}
          />
        </Card>

        <Card className="space-y-4">
          <p className="font-archivo text-[10px] uppercase tracking-[0.16em] text-[var(--dash-accent)]">
            Business development thinking
          </p>
          <AreaField
            label="Restaurant scenario"
            name="restaurantProblems"
            value={form.restaurantProblems}
            onChange={setText("restaurantProblems")}
          />
          <AreaField
            label='"We already have a website"'
            name="websiteObjection"
            value={form.websiteObjection}
            onChange={setText("websiteObjection")}
          />
          <AreaField
            label='"Too expensive"'
            name="expensiveObjection"
            value={form.expensiveObjection}
            onChange={setText("expensiveObjection")}
          />
          <AreaField
            label="17 of 20 rejected"
            name="rejectionResponse"
            value={form.rejectionResponse}
            onChange={setText("rejectionResponse")}
          />
        </Card>

        <Card className="space-y-4">
          <p className="font-archivo text-[10px] uppercase tracking-[0.16em] text-[var(--dash-accent)]">
            Editco & commitment
          </p>
          <CheckGroup
            label="Services of interest"
            name="services"
            options={SERVICE_OPTIONS}
            extra={form.services}
            selected={form.services}
            onToggle={(v) => toggleMulti("services", v)}
          />
          <AreaField
            label="Example business"
            name="exampleBusiness"
            value={form.exampleBusiness}
            onChange={setText("exampleBusiness")}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <SelectField
              label="Weekly hours"
              name="weeklyHours"
              value={form.weeklyHours}
              onChange={setText("weeklyHours")}
              options={withCurrent(WEEKLY_HOURS_OPTIONS, form.weeklyHours)}
            />
            <SelectField
              label="Performance-based earnings"
              name="performanceBased"
              value={form.performanceBased}
              onChange={setText("performanceBased")}
              options={withCurrent(PERFORMANCE_OPTIONS, form.performanceBased)}
            />
            <SelectField
              label="Training / onboarding"
              name="training"
              value={form.training}
              onChange={setText("training")}
              options={withCurrent(["Yes", "No"], form.training)}
            />
            <SelectField
              label="Duration"
              name="duration"
              value={form.duration}
              onChange={setText("duration")}
              options={withCurrent(DURATION_OPTIONS, form.duration)}
            />
          </div>
        </Card>

        <Card className="space-y-4">
          <p className="font-archivo text-[10px] uppercase tracking-[0.16em] text-[var(--dash-accent)]">
            Final pitch
          </p>
          <AreaField
            label="Why select you"
            name="whySelect"
            value={form.whySelect}
            onChange={setText("whySelect")}
          />
          <AreaField
            label="What they want to achieve"
            name="achievements"
            value={form.achievements}
            onChange={setText("achievements")}
          />
          <AreaField
            label="Anything else"
            name="anythingElse"
            value={form.anythingElse}
            onChange={setText("anythingElse")}
          />
        </Card>

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
          {saving ? "Saving…" : "Save application"}
        </button>
      </form>

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
                Email · {form.email}
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
                    to: form.email,
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
                WhatsApp · {form.phone}
              </p>
              <pre className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap font-inter text-xs leading-relaxed text-[var(--dash-muted)]">
                {waTpl}
              </pre>
              <a
                href={egaWhatsAppUrl(form.phone, waTpl)}
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

function AreaField({
  label,
  name,
  value,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block text-[var(--dash-muted)]">{label}</span>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows={4}
        className="w-full rounded-xl border border-[var(--dash-border)] bg-[var(--dash-input)] px-3 py-2.5 text-sm text-[var(--dash-text)] placeholder:text-[var(--dash-faint)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dash-accent)]"
      />
    </label>
  );
}

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block text-[var(--dash-muted)]">{label}</span>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="flex h-11 w-full rounded-xl border border-[var(--dash-border)] bg-[var(--dash-input)] px-3 text-sm text-[var(--dash-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dash-accent)]"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

function CheckGroup({
  label,
  name,
  options,
  extra,
  selected,
  onToggle,
}: {
  label: string;
  name: string;
  options: readonly string[];
  extra: string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  const all = [...new Set([...options, ...extra])];
  return (
    <fieldset>
      <legend className="mb-2 text-sm text-[var(--dash-muted)]">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {all.map((option) => {
          const checked = selected.includes(option);
          return (
            <label
              key={option}
              className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition ${
                checked
                  ? "border-[var(--dash-accent)] bg-[var(--dash-accent-soft)] text-[var(--dash-text)]"
                  : "border-[var(--dash-border)] text-[var(--dash-muted)] hover:text-[var(--dash-text)]"
              }`}
            >
              <input
                type="checkbox"
                name={name}
                value={option}
                checked={checked}
                onChange={() => onToggle(option)}
                className="sr-only"
              />
              {option}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
