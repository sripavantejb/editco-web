export const dynamic = "force-dynamic";

import { requireSalesAdminPage } from "@/lib/sales/page";
import { SalesAuditLog } from "@/models/sales/SalesAuditLog";
import { OsPage, OsTable, Td, Th } from "@/components/os/ui";
import { formatDateTime } from "@/lib/utils";

export default async function SalesAuditLogsPage() {
  await requireSalesAdminPage();
  const logs = await SalesAuditLog.find({}).sort({ createdAt: -1 }).limit(200).lean();

  return (
    <OsPage title="Audit Logs" subtitle="Who changed what, and when — permissions, assignments, approvals, stage changes." backHref="/sales/admin" backLabel="Back to dashboard">
      <OsTable>
        <thead>
          <tr><Th>When</Th><Th>Actor</Th><Th>Action</Th><Th>Entity</Th><Th>Field</Th><Th>Old → New</Th><Th>Reason</Th></tr>
        </thead>
        <tbody>
          {logs.map((l) => (
            <tr key={String(l._id)}>
              <Td>{formatDateTime(l.createdAt)}</Td>
              <Td>{l.actorEmail}</Td>
              <Td className="capitalize">{l.action.replace(/_/g, " ")}</Td>
              <Td>{l.entityType}</Td>
              <Td>{l.field || "—"}</Td>
              <Td className="max-w-xs truncate">{l.oldValue || l.newValue ? `${l.oldValue || "—"} → ${l.newValue || "—"}` : "—"}</Td>
              <Td className="max-w-xs truncate">{l.reason || "—"}</Td>
            </tr>
          ))}
        </tbody>
      </OsTable>
      {logs.length === 0 ? <p className="mt-6 font-inter text-sm text-[var(--dash-muted)]">No audit entries yet.</p> : null}
    </OsPage>
  );
}
