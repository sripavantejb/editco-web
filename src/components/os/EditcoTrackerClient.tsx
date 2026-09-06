"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  History,
  Trash2,
  ChevronDown,
  X,
} from "lucide-react";
import {
  EDITCO_TEAM_NAMES,
  EDITCO_TRACKER_STATUSES,
  EDITCO_TRACKER_STATUS_LABELS,
  EDITCO_TRACKER_STATUS_CLASSES,
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
  const [historyFor, setHistoryFor] = useState<TrackerRowView | null>(null);
  const [clockOpen, setClockOpen] = useState(false);
  const [depOpenId, setDepOpenId] = useState<string | null>(null);

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

  return (
    <div className={cn("space-y-4", pending && "opacity-80")}>
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

      <div className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white">
        <div className="max-h-[calc(100vh-220px)] overflow-auto">
          <table className="w-full min-w-[980px] border-collapse text-left">
            <thead className="sticky top-0 z-10 bg-[#f8f9fa]">
              <tr className="border-b border-[#e5e7eb]">
                {["Date", "Project", "Task", "Dependency", "POC", "Status", "Remarks", ""].map((h) => (
                  <th
                    key={h || "actions"}
                    className="px-3 py-2.5 font-inter text-[11px] font-semibold uppercase tracking-[0.08em] text-[#4b5563]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {initialRows.map((r) => (
                <tr key={r.id} className="border-b border-[#f3f4f6] last:border-0">
                  <td className="whitespace-nowrap px-3 py-2.5 font-inter text-[13px] text-[#111111]">
                    {formatDate(r.date)}
                  </td>
                  <td className="px-3 py-2.5">
                    <input
                      defaultValue={r.projectName}
                      onBlur={(e) => {
                        if (e.target.value.trim() && e.target.value !== r.projectName) {
                          saveField(r.id, "projectName", e.target.value.trim());
                        }
                      }}
                      className="w-full min-w-[120px] rounded-md border border-transparent bg-transparent px-1.5 py-1 font-inter text-[13px] text-[#111111] outline-none hover:border-[#e5e7eb] focus:border-[#111111]"
                    />
                  </td>
                  <td className="px-3 py-2.5">
                    <input
                      defaultValue={r.taskName}
                      onBlur={(e) => {
                        if (e.target.value.trim() && e.target.value !== r.taskName) {
                          saveField(r.id, "taskName", e.target.value.trim());
                        }
                      }}
                      className="w-full min-w-[120px] rounded-md border border-transparent bg-transparent px-1.5 py-1 font-inter text-[13px] text-[#111111] outline-none hover:border-[#e5e7eb] focus:border-[#111111]"
                    />
                  </td>
                  <td className="relative px-3 py-2.5">
                    <button
                      type="button"
                      onClick={() => setDepOpenId(depOpenId === r.id ? null : r.id)}
                      className="inline-flex max-w-[160px] items-center gap-1 rounded-lg border border-[#e5e7eb] bg-white px-2 py-1.5 font-inter text-[12px] text-[#111111]"
                    >
                      <span className="truncate">
                        {r.dependency.length ? r.dependency.join(", ") : "Select"}
                      </span>
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
                                  const next = checked
                                    ? r.dependency.filter((d) => d !== n)
                                    : [...r.dependency, n];
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
                  <td className="px-3 py-2.5">
                    <SelectChip
                      value={r.poc || ""}
                      options={[
                        { value: "", label: "—" },
                        ...EDITCO_TEAM_NAMES.map((n) => ({ value: n, label: n })),
                      ]}
                      onChange={(v) => saveField(r.id, "poc", v)}
                    />
                  </td>
                  <td className="px-3 py-2.5">
                    <SelectChip
                      value={r.status}
                      className={EDITCO_TRACKER_STATUS_CLASSES[r.status]}
                      options={EDITCO_TRACKER_STATUSES.map((s) => ({
                        value: s,
                        label: EDITCO_TRACKER_STATUS_LABELS[s],
                      }))}
                      onChange={(v) => saveField(r.id, "status", v)}
                    />
                  </td>
                  <td className="px-3 py-2.5">
                    <input
                      defaultValue={r.remarks}
                      onBlur={(e) => {
                        if (e.target.value !== r.remarks) {
                          saveField(r.id, "remarks", e.target.value);
                        }
                      }}
                      placeholder="—"
                      className="w-full min-w-[100px] rounded-md border border-transparent bg-transparent px-1.5 py-1 font-inter text-[13px] text-[#111111] outline-none placeholder:text-[#898989] hover:border-[#e5e7eb] focus:border-[#111111]"
                    />
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        aria-label="History"
                        onClick={() => setHistoryFor(r)}
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
              ))}
            </tbody>
          </table>
          {initialRows.length === 0 ? (
            <p className="px-4 py-8 font-inter text-sm text-[#6b7280]">No rows yet. Add the first one.</p>
          ) : null}
        </div>
      </div>

      {historyFor ? (
        <div className="fixed inset-0 z-[80] flex items-start justify-center px-4 pt-[10vh]">
          <button type="button" className="absolute inset-0 bg-black/40" onClick={() => setHistoryFor(null)} aria-label="Close" />
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-[#e5e7eb] px-4 py-3">
              <div>
                <p className="font-inter text-sm font-semibold text-[#111111]">Change history</p>
                <p className="font-inter text-xs text-[#6b7280]">
                  {historyFor.projectName} · {historyFor.taskName}
                </p>
              </div>
              <button type="button" onClick={() => setHistoryFor(null)} className="rounded-lg p-1.5 text-[#6b7280] hover:bg-[#f5f5f5]">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-[50vh] overflow-y-auto p-3">
              {historyFor.history.length === 0 ? (
                <p className="px-2 py-4 font-inter text-sm text-[#6b7280]">No changes recorded yet.</p>
              ) : (
                <ul className="space-y-2">
                  {historyFor.history.map((h, i) => (
                    <li key={`${h.at}-${i}`} className="rounded-xl border border-[#e5e7eb] px-3 py-2.5">
                      <p className="font-inter text-[13px] font-medium text-[#111111]">
                        {h.byName || h.byEmail} · <span className="capitalize">{h.field}</span>
                      </p>
                      <p className="mt-0.5 font-inter text-xs text-[#6b7280]">
                        {h.from ? `${h.from} → ${h.to}` : h.to}
                      </p>
                      <p className="mt-1 font-inter text-[11px] text-[#898989]">{formatDateTime(h.at)}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {clockOpen ? (
        <div className="fixed inset-0 z-[80] flex items-start justify-center px-4 pt-[12vh]">
          <button type="button" className="absolute inset-0 bg-black/40" onClick={() => setClockOpen(false)} aria-label="Close" />
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-[#e5e7eb] px-4 py-3">
              <div>
                <p className="font-inter text-sm font-semibold text-[#111111]">Team clock-ins · today</p>
                <p className="font-inter text-xs text-[#6b7280]">
                  Everyone&apos;s entry time for this day
                </p>
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
                    <span className="font-inter text-xs font-medium text-[#111111]">
                      {formatTime(c.checkedInAt)}
                    </span>
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
