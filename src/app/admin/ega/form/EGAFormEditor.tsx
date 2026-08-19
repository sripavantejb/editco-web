"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { saveEGAFormConfig } from "@/actions/ega-form";
import type { ActionState } from "@/actions/auth";
import {
  EGA_QUESTION_TYPES,
  slugQuestionName,
  type EGAFormConfigData,
  type EGAQuestion,
  type EGAQuestionType,
} from "@/lib/ega-form";
import { Card } from "@/components/referral/ui/card";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";

const TYPE_LABELS: Record<EGAQuestionType, string> = {
  short_text: "Short text",
  long_text: "Long text",
  email: "Email",
  phone: "Phone",
  select: "Dropdown",
  radio: "Single choice",
  multi_checkbox: "Multi choice",
  scale: "1–5 scale",
};

function needsOptions(type: EGAQuestionType) {
  return type === "select" || type === "radio" || type === "multi_checkbox";
}

export function EGAFormEditor({ initial }: { initial: EGAFormConfigData }) {
  const [copy, setCopy] = useState(initial.copy);
  const [questions, setQuestions] = useState<EGAQuestion[]>(initial.questions);
  const [state, action, pending] = useActionState<ActionState, FormData>(
    saveEGAFormConfig,
    {}
  );

  const update = (index: number, patch: Partial<EGAQuestion>) => {
    setQuestions((list) =>
      list.map((q, i) => {
        if (i !== index) return q;
        const next = { ...q, ...patch };
        if (patch.type && needsOptions(patch.type) && !next.options?.length) {
          next.options = ["Option 1", "Option 2"];
        }
        return next;
      })
    );
  };

  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= questions.length) return;
    setQuestions((list) => {
      const next = [...list];
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item);
      return next;
    });
  };

  const add = (section: 1 | 2 | 3 | 4 | 5) => {
    const label = "New question";
    setQuestions((list) => [
      ...list,
      {
        name: slugQuestionName(`${label}_${list.length}`),
        section,
        type: "short_text",
        label,
        required: false,
      },
    ]);
  };

  return (
    <form action={action} className="space-y-8">
      <input
        type="hidden"
        name="config"
        value={JSON.stringify({ copy, questions })}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-archivo text-[10px] uppercase tracking-[0.2em] text-[var(--dash-accent)]">
            Growth Associates
          </p>
          <h1 className="mt-1 font-archivo text-2xl uppercase tracking-tighter text-[var(--dash-text)] sm:text-3xl">
            Form questions
          </h1>
          <p className="mt-1 text-sm text-[var(--dash-muted)]">
            Edit the questions on{" "}
            <code className="text-[var(--dash-accent)]">
              /editco-growth-associate
            </code>
            . Applicants see this copy on the next visit.
          </p>
        </div>
        <Link
          href="/admin/ega"
          className="inline-flex h-9 items-center justify-center rounded-full border border-[var(--dash-border)] px-4 font-archivo text-xs uppercase tracking-[0.08em] text-[var(--dash-text)]"
        >
          Applications
        </Link>
      </div>

      <Card className="space-y-4">
        <p className="font-archivo text-[10px] uppercase tracking-[0.16em] text-[var(--dash-accent)]">
          Landing intro
        </p>
        <Field
          label="Kicker"
          value={copy.introKicker}
          onChange={(v) => setCopy((c) => ({ ...c, introKicker: v }))}
        />
        <Field
          label="Title"
          value={copy.introTitle}
          onChange={(v) => setCopy((c) => ({ ...c, introTitle: v }))}
        />
        <Field
          label="Time note"
          value={copy.introMinutes}
          onChange={(v) => setCopy((c) => ({ ...c, introMinutes: v }))}
        />
        <Area
          label="Intro paragraph"
          value={copy.introBody}
          onChange={(v) => setCopy((c) => ({ ...c, introBody: v }))}
        />
        <Area
          label="Bullets (one per line)"
          value={copy.introBullets.join("\n")}
          onChange={(v) =>
            setCopy((c) => ({
              ...c,
              introBullets: v.split("\n").map((s) => s.trim()).filter(Boolean),
            }))
          }
        />
      </Card>

      {([1, 2, 3, 4, 5] as const).map((section) => (
        <div key={section} className="space-y-3">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <label className="block min-w-[200px] flex-1 text-sm">
              <span className="mb-1.5 block text-[var(--dash-muted)]">
                Section {section} title
              </span>
              <input
                value={copy.sectionTitles[section]}
                onChange={(e) =>
                  setCopy((c) => ({
                    ...c,
                    sectionTitles: {
                      ...c.sectionTitles,
                      [section]: e.target.value,
                    },
                  }))
                }
                className="flex h-11 w-full rounded-xl border border-[var(--dash-border)] bg-[var(--dash-input)] px-3 text-sm text-[var(--dash-text)]"
              />
            </label>
            <button
              type="button"
              onClick={() => add(section)}
              className="inline-flex h-11 items-center gap-1.5 rounded-full border border-[var(--dash-border)] px-4 text-sm text-[var(--dash-text)]"
            >
              <Plus className="h-3.5 w-3.5" />
              Add question
            </button>
          </div>

          {questions.map((q, index) =>
            q.section === section ? (
              <Card key={`${q.name}-${index}`} className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-inter text-xs text-[var(--dash-faint)]">
                    {q.name}
                  </p>
                  <div className="flex gap-1">
                    <IconBtn
                      label="Move up"
                      onClick={() => move(index, -1)}
                      disabled={index === 0}
                    >
                      <ChevronUp className="h-4 w-4" />
                    </IconBtn>
                    <IconBtn
                      label="Move down"
                      onClick={() => move(index, 1)}
                      disabled={index === questions.length - 1}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </IconBtn>
                    <IconBtn
                      label="Remove"
                      onClick={() =>
                        setQuestions((list) => list.filter((_, i) => i !== index))
                      }
                    >
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </IconBtn>
                  </div>
                </div>
                <Field
                  label="Question"
                  value={q.label}
                  onChange={(v) => update(index, { label: v })}
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block text-sm">
                    <span className="mb-1.5 block text-[var(--dash-muted)]">
                      Type
                    </span>
                    <select
                      value={q.type}
                      onChange={(e) =>
                        update(index, {
                          type: e.target.value as EGAQuestionType,
                        })
                      }
                      className="flex h-11 w-full rounded-xl border border-[var(--dash-border)] bg-[var(--dash-input)] px-3 text-sm text-[var(--dash-text)]"
                    >
                      {EGA_QUESTION_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {TYPE_LABELS[t]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <Field
                    label="Help text"
                    value={q.helpText || ""}
                    onChange={(v) => update(index, { helpText: v })}
                  />
                </div>
                {q.type !== "scale" && q.type !== "radio" && q.type !== "multi_checkbox" ? (
                  <Field
                    label="Placeholder"
                    value={q.placeholder || ""}
                    onChange={(v) => update(index, { placeholder: v })}
                  />
                ) : null}
                {needsOptions(q.type) ? (
                  <Area
                    label="Options (one per line)"
                    value={(q.options || []).join("\n")}
                    onChange={(v) =>
                      update(index, {
                        options: v
                          .split("\n")
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                  />
                ) : null}
                {q.type === "scale" ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field
                      label="Low label (1)"
                      value={q.scaleLow || ""}
                      onChange={(v) => update(index, { scaleLow: v })}
                    />
                    <Field
                      label="High label (5)"
                      value={q.scaleHigh || ""}
                      onChange={(v) => update(index, { scaleHigh: v })}
                    />
                  </div>
                ) : null}
                {q.type === "multi_checkbox" ? (
                  <Field
                    label="Max selections (optional)"
                    value={q.max ? String(q.max) : ""}
                    onChange={(v) =>
                      update(index, {
                        max: v ? Number(v) || undefined : undefined,
                      })
                    }
                  />
                ) : null}
                <label className="flex min-h-11 items-center gap-2 text-sm text-[var(--dash-muted)]">
                  <input
                    type="checkbox"
                    checked={q.required}
                    onChange={(e) =>
                      update(index, { required: e.target.checked })
                    }
                  />
                  Required
                </label>
              </Card>
            ) : null
          )}
        </div>
      ))}

      {state.error ? (
        <p className="text-sm text-red-300">{state.error}</p>
      ) : null}
      {state.success ? (
        <p className="text-sm text-emerald-300">{state.success}</p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--dash-accent)] px-6 font-archivo text-xs uppercase tracking-[0.08em] text-[var(--dash-on-accent)] disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save questions"}
      </button>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block text-[var(--dash-muted)]">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex h-11 w-full rounded-xl border border-[var(--dash-border)] bg-[var(--dash-input)] px-3 text-sm text-[var(--dash-text)]"
      />
    </label>
  );
}

function Area({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block text-[var(--dash-muted)]">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className="w-full rounded-xl border border-[var(--dash-border)] bg-[var(--dash-input)] px-3 py-2.5 text-sm text-[var(--dash-text)]"
      />
    </label>
  );
}

function IconBtn({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[var(--dash-muted)] hover:bg-[var(--dash-hover)] disabled:opacity-30"
    >
      {children}
    </button>
  );
}
