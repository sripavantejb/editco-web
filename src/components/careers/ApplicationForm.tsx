"use client";

import { useActionState, useEffect, useRef } from "react";
import { submitJobApplication } from "@/actions/applications";
import type { ActionState } from "@/actions/auth";
import type { FormFieldDef } from "@/lib/jobs";
import { JOB_FILE_ACCEPT } from "@/lib/constants";

export function ApplicationForm({
  jobId,
  fields,
}: {
  jobId: string;
  fields: FormFieldDef[];
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    submitJobApplication,
    {}
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  if (!fields.length) {
    return (
      <p className="rounded-2xl border border-[var(--careers-border)] bg-[var(--careers-surface)] p-5 text-sm text-[var(--careers-muted)]">
        Applications are not open for this role yet.
      </p>
    );
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      className="space-y-5 rounded-[24px] border border-white/10 bg-white/[0.05] p-5 backdrop-blur-xl sm:p-7"
    >
      <input type="hidden" name="jobId" value={jobId} />
      <div>
        <p className="font-archivo text-[10px] uppercase tracking-[0.2em] text-[var(--careers-accent)]">
          Apply
        </p>
        <h2 className="mt-1 font-archivo text-xl uppercase tracking-tight text-[var(--careers-text)] sm:text-2xl">
          Application
        </h2>
      </div>

      {fields.map((field) => (
        <FieldControl key={field.id} field={field} />
      ))}

      {state.error && (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="rounded-xl border border-[var(--careers-accent)]/35 bg-[var(--careers-accent-soft)] px-4 py-3 text-sm text-[var(--careers-accent)]">
          {state.success}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="careers-cta inline-flex min-h-12 w-full items-center justify-center rounded-full px-6 font-archivo text-sm uppercase tracking-[0.1em] transition disabled:opacity-60 sm:w-auto sm:min-w-[200px]"
      >
        {pending ? "Submitting…" : "Submit application"}
      </button>
    </form>
  );
}

function FieldControl({ field }: { field: FormFieldDef }) {
  const name = `field_${field.id}`;
  const labelCls =
    "mb-1.5 block text-sm font-medium text-[var(--careers-muted)]";
  const inputCls =
    "w-full rounded-xl border border-[var(--careers-border)] bg-black/30 px-3 py-2.5 text-sm text-[var(--careers-text)] placeholder:text-[var(--careers-faint)] focus:outline-none focus:ring-2 focus:ring-[var(--careers-accent)]";

  return (
    <div>
      <label htmlFor={name} className={labelCls}>
        {field.label}
        {field.required ? (
          <span className="text-[var(--careers-accent)]"> *</span>
        ) : null}
      </label>
      {field.helpText ? (
        <p className="mb-1.5 text-xs text-[var(--careers-faint)]">
          {field.helpText}
        </p>
      ) : null}

      {field.type === "long_text" ? (
        <textarea
          id={name}
          name={name}
          required={field.required}
          placeholder={field.placeholder}
          rows={4}
          className={`${inputCls} min-h-[120px]`}
        />
      ) : field.type === "select" ? (
        <select
          id={name}
          name={name}
          required={field.required}
          className={inputCls}
          defaultValue=""
        >
          <option value="" disabled>
            Select…
          </option>
          {(field.options || []).map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : field.type === "radio" ? (
        <div className="space-y-2">
          {(field.options || []).map((o) => (
            <label
              key={o.value}
              className="flex min-h-11 items-center gap-3 rounded-xl border border-[var(--careers-border)] bg-black/20 px-3 text-sm text-[var(--careers-text)]"
            >
              <input
                type="radio"
                name={name}
                value={o.value}
                required={field.required}
                className="h-4 w-4 accent-[var(--careers-accent)]"
              />
              {o.label}
            </label>
          ))}
        </div>
      ) : field.type === "multi_checkbox" ? (
        <div className="space-y-2">
          {(field.options || []).map((o) => (
            <label
              key={o.value}
              className="flex min-h-11 items-center gap-3 rounded-xl border border-[var(--careers-border)] bg-black/20 px-3 text-sm text-[var(--careers-text)]"
            >
              <input
                type="checkbox"
                name={name}
                value={o.value}
                className="h-4 w-4 accent-[var(--careers-accent)]"
              />
              {o.label}
            </label>
          ))}
        </div>
      ) : field.type === "checkbox" ? (
        <label className="flex min-h-11 items-center gap-3 rounded-xl border border-[var(--careers-border)] bg-black/20 px-3 text-sm text-[var(--careers-text)]">
          <input
            id={name}
            type="checkbox"
            name={name}
            required={field.required}
            className="h-4 w-4 accent-[var(--careers-accent)]"
          />
          {field.placeholder || "Yes"}
        </label>
      ) : field.type === "file" ? (
        <input
          id={name}
          type="file"
          name={name}
          required={field.required}
          accept={field.accept || JOB_FILE_ACCEPT}
          className={`${inputCls} file:mr-3 file:rounded-full file:border-0 file:bg-[var(--careers-accent)] file:px-3 file:py-1.5 file:font-archivo file:text-[10px] file:uppercase file:text-[var(--careers-on-accent)]`}
        />
      ) : (
        <input
          id={name}
          type={
            field.type === "email"
              ? "email"
              : field.type === "phone"
                ? "tel"
                : field.type === "number"
                  ? "number"
                  : field.type === "url"
                    ? "url"
                    : field.type === "date"
                      ? "date"
                      : "text"
          }
          name={name}
          required={field.required}
          placeholder={field.placeholder}
          className={inputCls}
        />
      )}
    </div>
  );
}
