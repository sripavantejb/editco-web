"use client";

import { useMemo, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarClock,
  Clock,
  History,
  Repeat,
  Trash2,
  ChevronDown,
  X,
} from "lucide-react";
import {
  EDITCO_TEAM_NAMES,
  EDITCO_TRACKER_PRIORITIES,
  EDITCO_TRACKER_PRIORITY_CLASSES,
  EDITCO_TRACKER_PRIORITY_LABELS,
  EDITCO_TRACKER_PRIORITY_RANK,
  EDITCO_TRACKER_STATUSES,
  EDITCO_TRACKER_STATUS_LABELS,
  EDITCO_TRACKER_STATUS_CLASSES,
  isEditcoTrackerDone,
  type EditcoTrackerKind,
  type EditcoTrackerPriority,
  type EditcoTrackerStatus,
} from "@/lib/os/editco-tracker";
import {
  updateEditcoTrackerField,
  deleteEditcoTrackerRow,
} from "@/actions/os/editco-tracker";
import { cn, formatDate, formatDateTime, formatTime } from "@/lib/utils";

export type TrackerRowView = {
  id: string;
  date: string;
  projectName: string;
  taskName: string;
  dependency: string[];
  poc: string;
  status: EditcoTrackerStatus;
  remarks: string;
  priority: EditcoTrackerPriority;
  kind: EditcoTrackerKind;
  deadline: string | null;
  completedAt: string | null;
  createdAt: string;
  history: Array<{
    at: string;
    byEmail: string;
    byName: string;
    field: string;
    from: string;
    to: string;
  }>;
};

type CheckIn = {
  email: string;
  name: string;
  checkedInAt: string | null;
};

function SelectChip({
  value,
  options,
  className,
  onChange,
}: {
  value: string;
  options: { value: string; label: string }[];
  className?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative inline-flex">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "appearance-none rounded-lg border border-[#e5e7eb] bg-white py-1.5 pl-2.5 pr-7 font-inter text-[12px] font-medium text-[#111111] outline-none",
          className
        )}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#6b7280]" />
    </div>
  );
}

/** Open work first (by priority, then newest added); finished rows sink to the bottom. */
function sortRows(rows: TrackerRowView[]) {
  return rows.slice().sort((a, b) => {
    const aDone = isEditcoTrackerDone(a.status);
    const bDone = isEditcoTrackerDone(b.status);
    if (aDone !== bDone) return aDone ? 1 : -1;
    if (!aDone) {
      const p = EDITCO_TRACKER_PRIORITY_RANK[a.priority] - EDITCO_TRACKER_PRIORITY_RANK[b.priority];
      if (p !== 0) return p;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

function toLocalInput(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function deadlineBadge(deadline: string | null, done: boolean) {
  if (!deadline || done) return null;
  const ms = new Date(deadline).getTime() - Date.now();
  if (ms < 0) return { label: "Overdue", className: "bg-red-100 text-red-700" };
  const hours = ms / 3600000;
  if (hours < 24) return { label: `Due in ${Math.max(1, Math.round(hours))}h`, className: "bg-amber-100 text-amber-800" };
  const days = Math.round(hours / 24);
  return { label: `In ${days}d`, className: "bg-slate-100 text-slate-600" };
}

export function EditcoTrackerClient({
  rows: initialRows,
  myCheckInAt,
  todayCheckIns,
}: {
  rows: TrackerRowView[];
  myCheckInAt: string | null;
  todayCheckIns: CheckIn[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [detailId, setDetailId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [clockOpen, setClockOpen] = useState(false);
  const detail = detailId ? initialRows.find((r) => r.id === detailId) || null : null;
  const openDetail = (id: string) => {
    setDetailId(id);
    setEditing(false);
  };
  const [depOpenId, setDepOpenId] = useState<string | null>(null);

  const deadlineRows = useMemo(
    () => sortRows(initialRows.filter((r) => r.kind !== "daily")),
    [initialRows]
  );
  const dailyRows = useMemo(
    () => sortRows(initialRows.filter((r) => r.kind === "daily")),
    [initialRows]
  );

  const checkInLabel = useMemo(() => {
    const done = todayCheckIns.filter((c) => c.checkedInAt).length;
    const total = todayCheckIns.length || EDITCO_TEAM_NAMES.length;
    if (!myCheckInAt) return `Clock-in · ${done}/${total}`;
    const d = new Date(myCheckInAt);
    return `Team · ${done}/${total} · you ${formatTime(d)}`;
  }, [myCheckInAt, todayCheckIns]);

  const saveField = (rowId: string, field: string, value?: string, values?: string[]) => {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("rowId", rowId);
      fd.set("field", field);
      if (value !== undefined) fd.set("value", value);
      for (const v of values || []) fd.append("values", v);
      await updateEditcoTrackerField({}, fd);
      router.refresh();
    });
  };

  const removeRow = (rowId: string) => {
    if (!confirm("Delete this tracker row?")) return;
    startTransition(async () => {
      const fd = new FormData();
      fd.set("rowId", rowId);
      await deleteEditcoTrackerRow({}, fd);
      router.refresh();
    });
  };

  const cellTextClass = (done: boolean) =>
    cn(
      "block max-w-[220px] truncate text-left font-inter text-[13px]",
      done ? "text-[#9ca3af] line-through decoration-[#9ca3af]" : "text-[#111111]"
    );

  function renderRow(r: TrackerRowView, section: EditcoTrackerKind) {
    const done = isEditcoTrackerDone(r.status);
    const badge = deadlineBadge(r.deadline, done);
    return (
      <tr
        key={r.id}
        className={cn(
          "border-b border-[#f3f4f6] last:border-0 transition-colors",
          done ? "bg-[#f3f4f6]" : "hover:bg-[#fafafa]",
          detailId === r.id && "bg-[#f0f7ff]"
        )}
      >
        <td
          className={cn(
            "whitespace-nowrap px-3 py-2.5 font-inter text-[13px]",
            done ? "text-[#9ca3af] line-through" : "text-[#111111]"
          )}
        >
          {formatDate(r.date)}
        </td>
        <td className="cursor-pointer px-3 py-2.5" onClick={() => openDetail(r.id)}>
          <span className={cn(cellTextClass(done), "font-medium")} title={r.projectName}>
            {r.projectName}
          </span>
        </td>
        <td className="cursor-pointer px-3 py-2.5" onClick={() => openDetail(r.id)}>
          <span className={cellTextClass(done)} title={r.taskName}>
            {r.taskName}
          </span>
        </td>
        <td className={cn("px-3 py-2.5", done && "opacity-50")}>
          <SelectChip
            value={r.priority}
            className={EDITCO_TRACKER_PRIORITY_CLASSES[r.priority]}
            options={EDITCO_TRACKER_PRIORITIES.map((p) => ({
              value: p,
              label: EDITCO_TRACKER_PRIORITY_LABELS[p],
            }))}
            onChange={(v) => saveField(r.id, "priority", v)}
          />
        </td>
        <td className={cn("px-3 py-2.5", done && "opacity-50")}>
          {section === "deadline" ? (
            <div className="flex flex-col items-start gap-1">
              <input
                type="datetime-local"
                defaultValue={toLocalInput(r.deadline)}
                onBlur={(e) => {
                  const next = e.target.value ? new Date(e.target.value).toISOString() : "";
                  const prev = r.deadline ? new Date(r.deadline).toISOString() : "";
                  if (next !== prev) saveField(r.id, "deadline", next);
                }}
                className={cn(
                  "rounded-md border border-[#e5e7eb] bg-white px-1.5 py-1 font-inter text-[12px] outline-none focus:border-[#111111]",
                  done ? "text-[#9ca3af] line-through" : "text-[#111111]"
                )}
              />
              {badge ? (
                <span
                  suppressHydrationWarning
                  className={cn("rounded-full px-2 py-0.5 font-inter text-[10px] font-semibold", badge.className)}
                >
                  {badge.label}
                </span>
              ) : null}
            </div>
          ) : (
            <span className="font-inter text-[12px] text-[#6b7280]">
              {done && r.completedAt ? `Done ${formatTime(r.completedAt)}` : "Every day"}
            </span>
          )}
        </td>
        <td className={cn("relative px-3 py-2.5", done && "opacity-50")}>
          <button
            type="button"
            onClick={() => setDepOpenId(depOpenId === r.id ? null : r.id)}
            className="inline-flex max-w-[160px] items-center gap-1 rounded-lg border border-[#e5e7eb] bg-white px-2 py-1.5 font-inter text-[12px] text-[#111111]"
          >
            <span className="truncate">{r.dependency.length ? r.dependency.join(", ") : "Select"}</span>
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-[#6b7280]" />
          </button>
          {depOpenId === r.id ? (
            <div className="absolute left-3 top-[calc(100%-4px)] z-20 w-44 rounded-xl border border-[#e5e7eb] bg-white p-2 shadow-lg">
              {EDITCO_TEAM_NAMES.map((n) => {
                const checked = r.dependency.includes(n);
                return (
                  <label
                    key={n}
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 font-inter text-[12px] text-[#111111] hover:bg-[#f5f5f5]"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        const next = checked ? r.dependency.filter((d) => d !== n) : [...r.dependency, n];
                        saveField(r.id, "dependency", undefined, next);
                      }}
                      className="h-3.5 w-3.5"
                    />
                    {n}
                  </label>
                );
              })}
              <button
                type="button"
                onClick={() => setDepOpenId(null)}
                className="mt-1 w-full rounded-lg px-2 py-1.5 font-inter text-[11px] text-[#6b7280] hover:bg-[#f5f5f5]"
              >
                Done
              </button>
            </div>
          ) : null}
        </td>
        <td className={cn("px-3 py-2.5", done && "opacity-50")}>
          <SelectChip
            value={r.poc || ""}
            options={[{ value: "", label: "—" }, ...EDITCO_TEAM_NAMES.map((n) => ({ value: n, label: n }))]}
            onChange={(v) => saveField(r.id, "poc", v)}
          />
        </td>
        <td className="px-3 py-2.5">
          <SelectChip
            value={r.status}
            className={cn(EDITCO_TRACKER_STATUS_CLASSES[r.status], done && "opacity-70")}
            options={EDITCO_TRACKER_STATUSES.map((s) => ({
              value: s,
              label: EDITCO_TRACKER_STATUS_LABELS[s],
            }))}
            onChange={(v) => saveField(r.id, "status", v)}
          />
        </td>
        <td className="cursor-pointer px-3 py-2.5" onClick={() => openDetail(r.id)}>
          <span className={cn(cellTextClass(done), "max-w-[160px]", !r.remarks && "text-[#9ca3af]")} title={r.remarks}>
            {r.remarks || "—"}
          </span>
        </td>
        <td className="px-3 py-2.5">
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label={section === "daily" ? "Move to deadline tasks" : "Move to daily tasks"}
              title={section === "daily" ? "Move to deadline tasks" : "Move to daily tasks"}
              onClick={() => saveField(r.id, "kind", section === "daily" ? "deadline" : "daily")}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#6b7280] hover:bg-[#f5f5f5] hover:text-[#111111]"
            >
              {section === "daily" ? <CalendarClock className="h-4 w-4" /> : <Repeat className="h-4 w-4" />}
            </button>
            <button
              type="button"
              aria-label="Details & history"
              title="Details & history"
              onClick={() => openDetail(r.id)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#6b7280] hover:bg-[#f5f5f5] hover:text-[#111111]"
            >
              <History className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Delete"
              onClick={() => removeRow(r.id)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#6b7280] hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </td>
      </tr>
    );
  }

  function renderSection(title: string, subtitle: string, rows: TrackerRowView[], section: EditcoTrackerKind) {
    const open = rows.filter((r) => !isEditcoTrackerDone(r.status)).length;
    const headers = [
      "Date",
      "Project",
      "Task",
      "Priority",
      section === "deadline" ? "Deadline" : "Repeats",
      "Dependency",
      "POC",
      "Status",
      "Remarks",
      "",
    ];
    return (
      <section className="space-y-2">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h2 className="font-inter text-[15px] font-semibold text-[#111111]">
              {title} <span className="font-normal text-[#6b7280]">· {open} open / {rows.length}</span>
            </h2>
            <p className="font-inter text-xs text-[#6b7280]">{subtitle}</p>
          </div>
        </div>
        <div className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white">
          <div className="max-h-[calc(100vh-260px)] overflow-auto">
            <table className="w-full min-w-[1180px] border-collapse text-left">
              <thead className="sticky top-0 z-10 bg-[#f8f9fa]">
                <tr className="border-b border-[#e5e7eb]">
                  {headers.map((h) => (
                    <th
                      key={h || "actions"}
                      className="px-3 py-2.5 font-inter text-[11px] font-semibold uppercase tracking-[0.08em] text-[#4b5563]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>{rows.map((r) => renderRow(r, section))}</tbody>
            </table>
            {rows.length === 0 ? (
              <p className="px-4 py-8 font-inter text-sm text-[#6b7280]">
                {section === "daily" ? "No daily tasks yet." : "No deadline tasks yet. Add the first one."}
              </p>
            ) : null}
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className={cn("space-y-6", pending && "opacity-80")}>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setClockOpen(true)}
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-3 font-inter text-[13px] font-medium text-[#111111] transition hover:bg-[#f5f5f5]"
        >
          <Clock className="h-4 w-4" />
          {checkInLabel}
        </button>
      </div>

      {renderSection(
        "Deadline tasks",
        "One-off work with a due date & time — sorted by priority, then newest.",
        deadlineRows,
        "deadline"
      )}
      {renderSection(
        "Daily tasks",
        "Recurring work — completed items reopen automatically each morning (IST).",
        dailyRows,
        "daily"
      )}

      {detail ? (
        <TrackerDetailPanel
          row={detail}
          editing={editing}
          onEdit={() => setEditing(true)}
          onCancelEdit={() => setEditing(false)}
          onClose={() => setDetailId(null)}
          onSave={(changes) => {
            for (const [field, value] of Object.entries(changes)) saveField(detail.id, field, value);
            setEditing(false);
          }}
        />
      ) : null}

      {clockOpen ? (
        <div className="fixed inset-0 z-[80] flex items-start justify-center px-4 pt-[12vh]">
          <button
            type="button"
            className="absolute inset-0 bg-black/25 backdrop-blur-md"
            onClick={() => setClockOpen(false)}
            aria-label="Close"
          />
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-[#e5e7eb] px-4 py-3">
              <div>
                <p className="font-inter text-sm font-semibold text-[#111111]">Team clock-ins · today</p>
                <p className="font-inter text-xs text-[#6b7280]">Everyone&apos;s entry time for this day</p>
              </div>
              <button type="button" onClick={() => setClockOpen(false)} className="rounded-lg p-1.5 text-[#6b7280] hover:bg-[#f5f5f5]">
                <X className="h-4 w-4" />
              </button>
            </div>
            <ul className="max-h-[50vh] space-y-2 overflow-y-auto p-3">
              {todayCheckIns.map((c) => (
                <li key={c.email} className="flex items-center justify-between rounded-xl border border-[#e5e7eb] px-3 py-2.5">
                  <span className="font-inter text-[13px] font-medium text-[#111111]">{c.name || c.email}</span>
                  {c.checkedInAt ? (
                    <span className="font-inter text-xs font-medium text-[#111111]">{formatTime(c.checkedInAt)}</span>
                  ) : (
                    <span className="font-inter text-xs text-[#898989]">Not yet</span>
                  )}
                </li>
              ))}
              {todayCheckIns.length === 0 ? (
                <li className="px-2 py-4 font-inter text-sm text-[#6b7280]">No team members configured.</li>
              ) : null}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function DetailField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[112px_1fr] items-start gap-3 py-2">
      <dt className="pt-0.5 font-inter text-[12px] text-[#6b7280]">{label}</dt>
      <dd className="min-w-0 font-inter text-[13px] text-[#111111]">{children}</dd>
    </div>
  );
}

function TrackerDetailPanel({
  row,
  editing,
  onEdit,
  onCancelEdit,
  onClose,
  onSave,
}: {
  row: TrackerRowView;
  editing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onClose: () => void;
  onSave: (changes: Record<string, string>) => void;
}) {
  const done = isEditcoTrackerDone(row.status);
  const [projectName, setProjectName] = useState(row.projectName);
  const [taskName, setTaskName] = useState(row.taskName);
  const [remarks, setRemarks] = useState(row.remarks);
  const inputClass =
    "w-full rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 font-inter text-[13px] text-[#111111] outline-none focus:border-[#111111]";

  const startEdit = () => {
    setProjectName(row.projectName);
    setTaskName(row.taskName);
    setRemarks(row.remarks);
    onEdit();
  };

  const save = () => {
    const changes: Record<string, string> = {};
    if (projectName.trim() && projectName.trim() !== row.projectName) changes.projectName = projectName.trim();
    if (taskName.trim() && taskName.trim() !== row.taskName) changes.taskName = taskName.trim();
    if (remarks !== row.remarks) changes.remarks = remarks;
    onSave(changes);
  };

  return (
    <div className="fixed inset-0 z-[80] flex justify-end">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/20 backdrop-blur-[6px]"
        onClick={onClose}
      />
      <aside className="relative flex h-full w-full max-w-[460px] flex-col border-l border-[#e5e7eb] bg-white shadow-[-12px_0_40px_rgba(0,0,0,0.08)]">
        <header className="flex items-start justify-between gap-3 border-b border-[#e5e7eb] px-5 py-4">
          <div className="min-w-0">
            <p className="font-inter text-[11px] font-semibold uppercase tracking-[0.1em] text-[#6b7280]">
              {row.kind === "daily" ? "Daily task" : "Deadline task"}
            </p>
            <h2 className={cn("mt-1 font-inter text-[17px] font-semibold text-[#111111]", done && "text-[#9ca3af] line-through")}>
              {row.taskName}
            </h2>
            <p className="mt-0.5 truncate font-inter text-[13px] text-[#6b7280]">{row.projectName}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-[#6b7280] hover:bg-[#f5f5f5]">
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {editing ? (
            <div className="space-y-3">
              <label className="block space-y-1.5">
                <span className="font-inter text-xs text-[#6b7280]">Project</span>
                <input value={projectName} onChange={(e) => setProjectName(e.target.value)} className={inputClass} />
              </label>
              <label className="block space-y-1.5">
                <span className="font-inter text-xs text-[#6b7280]">Task</span>
                <input value={taskName} onChange={(e) => setTaskName(e.target.value)} className={inputClass} />
              </label>
              <label className="block space-y-1.5">
                <span className="font-inter text-xs text-[#6b7280]">Remarks</span>
                <textarea rows={4} value={remarks} onChange={(e) => setRemarks(e.target.value)} className={inputClass} />
              </label>
              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={onCancelEdit} className="h-9 rounded-lg border border-[#e5e7eb] px-3 font-inter text-[13px] text-[#111111] hover:bg-[#f5f5f5]">
                  Cancel
                </button>
                <button type="button" onClick={save} className="h-9 rounded-lg bg-[#111111] px-4 font-inter text-[13px] font-medium text-white hover:bg-[#262626]">
                  Save changes
                </button>
              </div>
            </div>
          ) : (
            <dl className="divide-y divide-[#f3f4f6]">
              <DetailField label="Status">
                <span className={cn("inline-flex rounded-md px-2 py-0.5 text-[12px] font-medium", EDITCO_TRACKER_STATUS_CLASSES[row.status])}>
                  {EDITCO_TRACKER_STATUS_LABELS[row.status]}
                </span>
              </DetailField>
              <DetailField label="Priority">
                <span className={cn("inline-flex rounded-md px-2 py-0.5 text-[12px] font-medium", EDITCO_TRACKER_PRIORITY_CLASSES[row.priority])}>
                  {EDITCO_TRACKER_PRIORITY_LABELS[row.priority]}
                </span>
              </DetailField>
              <DetailField label={row.kind === "daily" ? "Repeats" : "Deadline"}>
                {row.kind === "daily" ? "Every day" : row.deadline ? formatDateTime(row.deadline) : "Not set"}
              </DetailField>
              <DetailField label="POC">{row.poc || "—"}</DetailField>
              <DetailField label="Dependency">{row.dependency.length ? row.dependency.join(", ") : "—"}</DetailField>
              <DetailField label="Date">{formatDate(row.date)}</DetailField>
              {row.completedAt ? <DetailField label="Completed">{formatDateTime(row.completedAt)}</DetailField> : null}
              <DetailField label="Added">{formatDateTime(row.createdAt)}</DetailField>
              <DetailField label="Remarks">
                <span className="whitespace-pre-wrap">{row.remarks || "—"}</span>
              </DetailField>
            </dl>
          )}

          <h3 className="mb-2 mt-6 font-inter text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6b7280]">
            History
          </h3>
          {row.history.length === 0 ? (
            <p className="font-inter text-sm text-[#6b7280]">No changes recorded yet.</p>
          ) : (
            <ol className="relative space-y-3 border-l border-[#e5e7eb] pl-4">
              {row.history.map((h, i) => (
                <li key={`${h.at}-${i}`} className="relative">
                  <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#9ca3af]" />
                  <p className="font-inter text-[13px] text-[#111111]">
                    <span className="font-medium">{h.byName || h.byEmail}</span>{" "}
                    <span className="text-[#6b7280]">changed</span> <span className="capitalize">{h.field}</span>
                  </p>
                  <p className="mt-0.5 font-inter text-xs text-[#4b5563]">{h.from ? `${h.from} → ${h.to}` : h.to}</p>
                  <p className="mt-0.5 font-inter text-[11px] text-[#9ca3af]">{formatDateTime(h.at)}</p>
                </li>
              ))}
            </ol>
          )}
        </div>

        {!editing ? (
          <footer className="flex justify-end border-t border-[#e5e7eb] px-5 py-3">
            <button
              type="button"
              onClick={startEdit}
              className="h-9 rounded-lg border border-[#e5e7eb] px-3 font-inter text-[13px] font-medium text-[#111111] hover:bg-[#f5f5f5]"
            >
              Edit details
            </button>
          </footer>
        ) : null}
      </aside>
    </div>
  );
}
