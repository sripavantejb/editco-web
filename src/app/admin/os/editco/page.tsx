export const dynamic = "force-dynamic";

import { requireOsPage } from "@/lib/os/page";
import { EditcoTrackerRow, EDITCO_TRACKER_STATUSES, EDITCO_TRACKER_STATUS_LABELS, EDITCO_TRACKER_STATUS_CLASSES, type EditcoTrackerStatus } from "@/models/os/EditcoTrackerRow";
import { createEditcoTrackerRow, updateEditcoTrackerRowStatus } from "@/actions/os/editco-tracker";
import { OsActionForm } from "@/components/os/OsActionForm";
import { SalesModal } from "@/components/sales/SalesModal";
import { Field, OsPage, OsTable, Td, Th, osInputClass, osTextareaClass } from "@/components/os/ui";
import { OsSelect } from "@/components/os/OsSelect";
import { cn, formatDate } from "@/lib/utils";

async function updateStatusForm(formData: FormData) {
  "use server";
  await updateEditcoTrackerRowStatus({}, formData);
}

export default async function EditcoTrackerPage() {
  await requireOsPage("*");
  const rows = await EditcoTrackerRow.find({}).sort({ date: -1, createdAt: -1 }).limit(300).lean();

  return (
    <OsPage
      title="Editco"
      subtitle="The master tracker — every project and task across the company, one row at a time."
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
                <input name="poc" placeholder="e.g. Harsha" className={osInputClass()} />
              </Field>
            </div>
            <Field label="Project name">
              <input name="projectName" required className={osInputClass()} />
            </Field>
            <Field label="Task name">
              <input name="taskName" required className={osInputClass()} />
            </Field>
            <Field label="Dependency (comma-separated names)">
              <input name="dependency" placeholder="e.g. Harsha, Deepika" className={osInputClass()} />
            </Field>
            <Field label="Status">
              <OsSelect
                name="status"
                options={EDITCO_TRACKER_STATUSES.map((s) => ({ value: s, label: EDITCO_TRACKER_STATUS_LABELS[s] }))}
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
      <OsTable>
        <thead>
          <tr>
            <Th>Date</Th>
            <Th>Project Name</Th>
            <Th>Task Name</Th>
            <Th>Dependency</Th>
            <Th>POC</Th>
            <Th>Status</Th>
            <Th>Remarks</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={String(r._id)}>
              <Td className="whitespace-nowrap">{formatDate(r.date)}</Td>
              <Td>{r.projectName}</Td>
              <Td>{r.taskName}</Td>
              <Td>
                <div className="flex flex-wrap gap-1">
                  {(r.dependency as string[]).map((d) => (
                    <span key={d} className="rounded-full bg-white/10 px-2 py-0.5 font-inter text-[11px] text-[var(--dash-text)]">
                      {d}
                    </span>
                  ))}
                  {r.dependency.length === 0 ? "—" : null}
                </div>
              </Td>
              <Td className="whitespace-nowrap">{r.poc || "—"}</Td>
              <Td>
                <details>
                  <summary
                    className={cn(
                      "inline-flex cursor-pointer list-none rounded-full px-2.5 py-1 font-inter text-[11px] font-medium",
                      EDITCO_TRACKER_STATUS_CLASSES[r.status as EditcoTrackerStatus]
                    )}
                  >
                    {EDITCO_TRACKER_STATUS_LABELS[r.status as EditcoTrackerStatus]}
                  </summary>
                  <form action={updateStatusForm} className="mt-2 flex flex-wrap gap-1">
                    <input type="hidden" name="rowId" value={String(r._id)} />
                    {EDITCO_TRACKER_STATUSES.filter((s) => s !== r.status).map((s) => (
                      <button
                        key={s}
                        type="submit"
                        name="status"
                        value={s}
                        className={cn("rounded-full px-2 py-1 font-inter text-[10px]", EDITCO_TRACKER_STATUS_CLASSES[s])}
                      >
                        {EDITCO_TRACKER_STATUS_LABELS[s]}
                      </button>
                    ))}
                  </form>
                </details>
              </Td>
              <Td className="max-w-xs">{r.remarks || "—"}</Td>
            </tr>
          ))}
        </tbody>
      </OsTable>
      {rows.length === 0 ? (
        <p className="mt-6 font-inter text-sm text-[var(--dash-muted)]">No rows yet. Add the first one.</p>
      ) : null}
    </OsPage>
  );
}
