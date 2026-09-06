"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, ExternalLink } from "lucide-react";
import { formatCurrencyINR, cn } from "@/lib/utils";
import { CopyPortalUrl } from "@/components/os/CopyPortalUrl";
import { GeneratePortalForm } from "@/components/os/OsForms";
import { RowDeleteButton } from "@/components/os/RowDeleteButton";
import { deleteVendor } from "@/actions/os/vendors";

const STATUS_LABELS: Record<string, string> = {
  working_on_project: "Working on Project",
  active: "Active",
  inactive: "Inactive",
};

const STATUS_CLASSES: Record<string, string> = {
  working_on_project: "bg-amber-100 text-amber-800",
  active: "bg-emerald-100 text-emerald-800",
  inactive: "bg-rose-100 text-rose-700",
};

export type ClientRowView = {
  id: string;
  companyName: string;
  contactPerson: string;
  location: string;
  activeStatus: string;
  conversionUuid: string;
  publicCode: string;
  accountOwner: string;
  received: number;
  outstanding: number;
  portalUrl: string | null;
  canWrite: boolean;
};

export function ClientsTable({ rows }: { rows: ClientRowView[] }) {
  const [selected, setSelected] = useState<ClientRowView | null>(null);

  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [selected]);

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left">
            <thead className="bg-[#f8f9fa]">
              <tr className="border-b border-[#e5e7eb]">
                {[
                  "Company",
                  "Contact",
                  "Location",
                  "Active Status",
                  "Conversion",
                  "Owner",
                  "Received",
                  "Outstanding",
                  "Portal",
                  "",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-3 py-2.5 font-inter text-[11px] font-semibold uppercase tracking-[0.08em] text-[#4b5563]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((v) => (
                <tr key={v.id} className="border-b border-[#f3f4f6] last:border-0">
                  <td className="px-3 py-2.5">
                    <button
                      type="button"
                      onClick={() => setSelected(v)}
                      className="text-left font-inter text-sm font-medium text-[#111111] underline-offset-2 hover:underline"
                    >
                      {v.companyName}
                    </button>
                  </td>
                  <td className="px-3 py-2.5 font-inter text-sm text-[#374151]">
                    {v.contactPerson || "—"}
                  </td>
                  <td className="px-3 py-2.5 font-inter text-sm text-[#374151]">
                    {v.location || "—"}
                  </td>
                  <td className="px-3 py-2.5">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-1 font-inter text-[11px] font-medium",
                        STATUS_CLASSES[v.activeStatus] || STATUS_CLASSES.active
                      )}
                    >
                      {STATUS_LABELS[v.activeStatus] || v.activeStatus || "Active"}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <button
                      type="button"
                      onClick={() => setSelected(v)}
                      className="font-inter text-sm text-[#111111] underline-offset-2 hover:underline"
                    >
                      {v.publicCode || "—"}
                    </button>
                  </td>
                  <td className="px-3 py-2.5 font-inter text-sm text-[#374151]">
                    {v.accountOwner || "—"}
                  </td>
                  <td className="px-3 py-2.5 font-inter text-sm text-[#111111]">
                    {formatCurrencyINR(v.received)}
                  </td>
                  <td className="px-3 py-2.5 font-inter text-sm text-[#111111]">
                    {formatCurrencyINR(v.outstanding)}
                  </td>
                  <td className="px-3 py-2.5">
                    {v.portalUrl ? (
                      <CopyPortalUrl url={v.portalUrl} />
                    ) : (
                      <span className="font-inter text-xs text-[#898989]">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    {v.canWrite ? (
                      <RowDeleteButton
                        action={deleteVendor}
                        id={v.id}
                        confirmMessage={`Delete client "${v.companyName}"?`}
                      />
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 ? (
            <p className="px-4 py-8 font-inter text-sm text-[#6b7280]">No clients yet.</p>
          ) : null}
        </div>
      </div>

      {selected ? (
        <div className="fixed inset-0 z-[90] flex items-start justify-center px-4 pt-[8vh]">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close"
            onClick={() => setSelected(null)}
          />
          <div className="relative max-h-[84vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#e5e7eb] bg-white shadow-xl">
            <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-[#e5e7eb] bg-white px-5 py-4">
              <div className="min-w-0">
                <p className="font-inter text-sm font-semibold text-[#111111]">
                  {selected.companyName}
                </p>
                <p className="mt-0.5 font-inter text-xs text-[#6b7280]">
                  {selected.contactPerson || "No contact"} · {selected.location || "No location"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-lg p-1.5 text-[#6b7280] hover:bg-[#f5f5f5]"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-5 p-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-[#e5e7eb] bg-[#f8f9fa] p-3">
                  <p className="font-inter text-[11px] uppercase tracking-[0.1em] text-[#6b7280]">
                    Received
                  </p>
                  <p className="mt-1 font-inter text-base font-semibold text-[#111111]">
                    {formatCurrencyINR(selected.received)}
                  </p>
                </div>
                <div className="rounded-xl border border-[#e5e7eb] bg-[#f8f9fa] p-3">
                  <p className="font-inter text-[11px] uppercase tracking-[0.1em] text-[#6b7280]">
                    Outstanding
                  </p>
                  <p className="mt-1 font-inter text-base font-semibold text-[#111111]">
                    {formatCurrencyINR(selected.outstanding)}
                  </p>
                </div>
              </div>

              <section>
                <h3 className="mb-2 font-inter text-[11px] font-semibold uppercase tracking-[0.12em] text-[#111111]">
                  Conversion code
                </h3>
                <div className="rounded-xl border border-[#e5e7eb] px-3 py-3">
                  <p className="font-inter text-sm font-medium text-[#111111]">
                    {selected.publicCode || "—"}
                  </p>
                  <p className="mt-1 break-all font-inter text-[11px] text-[#6b7280]">
                    UUID · {selected.conversionUuid}
                  </p>
                  {selected.publicCode ? (
                    <Link
                      href={`/admin/os/c/${selected.publicCode}`}
                      className="mt-2 inline-flex items-center gap-1 font-inter text-xs font-medium text-[#111111] underline-offset-2 hover:underline"
                    >
                      Open conversion hub <ExternalLink className="h-3 w-3" />
                    </Link>
                  ) : null}
                </div>
              </section>

              <section>
                <h3 className="mb-2 font-inter text-[11px] font-semibold uppercase tracking-[0.12em] text-[#111111]">
                  Client portal
                </h3>
                {selected.portalUrl ? (
                  <div className="rounded-xl border border-[#e5e7eb] p-3">
                    <p className="mb-2 font-inter text-xs text-[#6b7280]">
                      Live portal link for this client
                    </p>
                    <CopyPortalUrl url={selected.portalUrl} />
                  </div>
                ) : selected.canWrite ? (
                  <GeneratePortalForm conversionUuid={selected.conversionUuid} />
                ) : (
                  <p className="font-inter text-sm text-[#6b7280]">Portal not generated yet.</p>
                )}
              </section>

              <div className="flex flex-wrap gap-2 border-t border-[#e5e7eb] pt-4">
                <Link
                  href={`/admin/os/vendors/${selected.id}`}
                  className="inline-flex h-10 items-center rounded-lg bg-[#111111] px-4 font-inter text-[13px] font-medium text-white"
                >
                  Full client page
                </Link>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="inline-flex h-10 items-center rounded-lg border border-[#e5e7eb] px-4 font-inter text-[13px] text-[#374151]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
