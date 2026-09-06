export const dynamic = "force-dynamic";

import { requireOsPage } from "@/lib/os/page";
import { EditcoTrackerRow } from "@/models/os/EditcoTrackerRow";
import {
  createEditcoTrackerRow,
  ensureEditcoTrackerCheckIn,
  getTodayEditcoCheckIns,
} from "@/actions/os/editco-tracker";
import { OsActionForm } from "@/components/os/OsActionForm";
import { SalesModal } from "@/components/sales/SalesModal";
import { Field, OsPage, osInputClass, osTextareaClass } from "@/components/os/ui";
import { OsSelect } from "@/components/os/OsSelect";
import { EditcoTrackerClient, type TrackerRowView } from "@/components/os/EditcoTrackerClient";
import {
  EDITCO_TEAM_NAMES,
  EDITCO_TRACKER_STATUSES,
  EDITCO_TRACKER_STATUS_LABELS,
} from "@/lib/os/editco-tracker";

export default async function EditcoTrackerPage() {
  await requireOsPage("*");
  const [rows, checkIn, todayCheckIns] = await Promise.all([
    EditcoTrackerRow.find({}).sort({ date: -1, createdAt: -1 }).limit(300).lean(),
    ensureEditcoTrackerCheckIn(),
    getTodayEditcoCheckIns(),
  ]);

  const viewRows: TrackerRowView[] = rows.map((r) => ({
    id: String(r._id),
    date: new Date(r.date).toISOString(),
    projectName: r.projectName,
    taskName: r.taskName,
    dependency: (r.dependency as string[]) || [],
    poc: r.poc || "",
    status: r.status,
    remarks: r.remarks || "",
    history: ((r.history as Array<{
      at: Date;
      byEmail: string;
      byName: string;
      field: string;
      from: string;
      to: string;
    }>) || []).map((h) => ({
      at: new Date(h.at).toISOString(),
      byEmail: h.byEmail || "",
      byName: h.byName || "",
      field: h.field || "",
      from: h.from || "",
      to: h.to || "",
    })),
  }));

  return (
    <OsPage
      title="Master Tracker"
      subtitle="Every project and task — editable dropdowns, history, and daily clock-in."
      backHref="/admin/os"
      backLabel="Back to dashboard"
      actions={
        <SalesModal triggerLabel="Add row" title="Add row">
          <OsActionForm action={createEditcoTrackerRow} submitLabel="Add row" className="grid gap-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Date">
                <input name="date" type="date" required className={osInputClass()} />
              </Field>
              <Field label="POC">
                <OsSelect
                  name="poc"
                  defaultValue=""
                  placeholder="Select POC"
                  options={EDITCO_TEAM_NAMES.map((n) => ({ value: n, label: n }))}
                />
              </Field>
            </div>
            <Field label="Project name">
              <input name="projectName" required className={osInputClass()} />
            </Field>
            <Field label="Task name">
              <input name="taskName" required className={osInputClass()} />
            </Field>
            <Field label="Dependency">
              <div className="flex flex-wrap gap-4 pt-1">
                {EDITCO_TEAM_NAMES.map((n) => (
                  <label key={n} className="flex items-center gap-1.5 font-inter text-xs text-[var(--dash-text)]">
                    <input
                      type="checkbox"
                      name="dependency"
                      value={n}
                      className="h-3.5 w-3.5 rounded border-[var(--dash-border)] bg-[var(--dash-input)] accent-[var(--dash-accent)]"
                    />
                    {n}
                  </label>
                ))}
              </div>
            </Field>
            <Field label="Status">
              <OsSelect
                name="status"
                options={EDITCO_TRACKER_STATUSES.map((s) => ({
                  value: s,
                  label: EDITCO_TRACKER_STATUS_LABELS[s],
                }))}
                defaultValue="not_yet_started"
              />
            </Field>
            <Field label="Remarks">
              <textarea name="remarks" className={osTextareaClass()} />
            </Field>
          </OsActionForm>
        </SalesModal>
      }
    >
      <EditcoTrackerClient
        rows={viewRows}
        myCheckInAt={checkIn?.checkedInAt ?? null}
        todayCheckIns={todayCheckIns.map((c) => ({
          email: c.email,
          name: c.name || c.email,
          checkedInAt: c.checkedInAt,
        }))}
      />
    </OsPage>
  );
}
