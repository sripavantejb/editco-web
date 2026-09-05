"use client";

import { useMemo, useState } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { saveSalesPermissions } from "@/actions/sales/permissions";
import type { ActionState } from "@/actions/auth";
import { SALES_MODULE_GROUPS, salesModulesByGroup, type SalesModuleKey } from "@/lib/sales/modules";
import { OsBadge } from "@/components/os/ui";

type ModuleState = Record<SalesModuleKey, boolean>;

const initialAction: ActionState = {};

function SaveButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="inline-flex min-h-11 items-center rounded-full bg-[var(--dash-accent)] px-6 font-archivo text-xs uppercase tracking-[0.08em] text-[var(--dash-on-accent)] disabled:opacity-50"
    >
      {pending ? "Saving..." : "Save changes"}
    </button>
  );
}

export function PermissionEditor({
  employeeId,
  savedEffective,
  roleDefaults,
}: {
  employeeId: string;
  savedEffective: ModuleState;
  roleDefaults: ModuleState;
}) {
  const [state, setState] = useState<ModuleState>(savedEffective);
  const [formState, formAction] = useActionState(saveSalesPermissions, initialAction);

  const dirty = useMemo(
    () => Object.keys(state).some((k) => state[k as SalesModuleKey] !== savedEffective[k as SalesModuleKey]),
    [state, savedEffective]
  );

  function setAll(value: boolean) {
    setState((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(next)) next[key as SalesModuleKey] = value;
      return next;
    });
  }

  function setGroup(group: (typeof SALES_MODULE_GROUPS)[number], value: boolean) {
    setState((prev) => {
      const next = { ...prev };
      for (const m of salesModulesByGroup(group)) next[m.key] = value;
      return next;
    });
  }

  function resetToDefault() {
    setState({ ...roleDefaults });
  }

  return (
    <form action={formAction} className="space-y-6 pb-24">
      <input type="hidden" name="employeeId" value={employeeId} />
      <input type="hidden" name="desiredState" value={JSON.stringify(state)} />

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setAll(true)}
          className="inline-flex min-h-10 items-center rounded-full border border-[var(--dash-border)] px-4 font-archivo text-[11px] uppercase tracking-[0.08em] text-[var(--dash-text)] hover:border-[var(--dash-accent)] hover:text-[var(--dash-accent)]"
        >
          Enable all
        </button>
        <button
          type="button"
          onClick={() => setAll(false)}
          className="inline-flex min-h-10 items-center rounded-full border border-[var(--dash-border)] px-4 font-archivo text-[11px] uppercase tracking-[0.08em] text-[var(--dash-text)] hover:border-[var(--dash-accent)] hover:text-[var(--dash-accent)]"
        >
          Disable all
        </button>
        <button
          type="button"
          onClick={resetToDefault}
          className="inline-flex min-h-10 items-center rounded-full border border-[var(--dash-border)] px-4 font-archivo text-[11px] uppercase tracking-[0.08em] text-[var(--dash-text)] hover:border-[var(--dash-accent)] hover:text-[var(--dash-accent)]"
        >
          Reset to default
        </button>
      </div>

      {formState.error ? <p className="text-sm text-red-400">{formState.error}</p> : null}
      {formState.success && !dirty ? <p className="text-sm text-emerald-400">{formState.success}</p> : null}

      <div className="space-y-5">
        {SALES_MODULE_GROUPS.map((group) => {
          const items = salesModulesByGroup(group);
          const enabledCount = items.filter((m) => state[m.key]).length;
          return (
            <section key={group} className="rounded-[20px] border border-[var(--dash-border)] p-5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-archivo text-sm uppercase tracking-wide text-[var(--dash-text)]">
                    {group}
                  </h3>
                  <OsBadge tone="neutral">
                    {enabledCount}/{items.length}
                  </OsBadge>
                </div>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setGroup(group, true)}
                    className="rounded-full px-3 py-1 font-inter text-[11px] text-[var(--dash-muted)] hover:bg-[var(--dash-hover)] hover:text-[var(--dash-text)]"
                  >
                    All on
                  </button>
                  <button
                    type="button"
                    onClick={() => setGroup(group, false)}
                    className="rounded-full px-3 py-1 font-inter text-[11px] text-[var(--dash-muted)] hover:bg-[var(--dash-hover)] hover:text-[var(--dash-text)]"
                  >
                    All off
                  </button>
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {items.map((m) => {
                  const isCustom = state[m.key] !== roleDefaults[m.key];
                  return (
                    <label
                      key={m.key}
                      className="flex items-center justify-between gap-3 rounded-xl border border-[var(--dash-border)] px-3 py-2.5"
                    >
                      <span className="flex items-center gap-2 font-inter text-sm text-[var(--dash-text)]">
                        {m.label}
                        {isCustom ? <OsBadge tone="accent">Custom</OsBadge> : null}
                      </span>
                      <input
                        type="checkbox"
                        checked={state[m.key]}
                        onChange={(e) =>
                          setState((prev) => ({ ...prev, [m.key]: e.target.checked }))
                        }
                        className="h-5 w-5 accent-[var(--dash-accent)]"
                      />
                    </label>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      <div
        className={`fixed inset-x-0 bottom-0 z-30 border-t border-[var(--dash-border)] bg-[var(--dash-bg)]/95 px-4 py-3 backdrop-blur-xl transition-transform lg:pl-[276px] ${
          dirty ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-inter text-sm text-[var(--dash-muted)]">
            You have unsaved changes.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setState(savedEffective)}
              className="inline-flex min-h-11 items-center rounded-full border border-[var(--dash-border)] px-5 font-archivo text-xs uppercase tracking-[0.08em] text-[var(--dash-text)]"
            >
              Discard
            </button>
            <SaveButton disabled={!dirty} />
          </div>
        </div>
      </div>
    </form>
  );
}
