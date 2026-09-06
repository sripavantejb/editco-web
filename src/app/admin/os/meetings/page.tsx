export const dynamic = "force-dynamic";

import Link from "next/link";
import { requireOsPage } from "@/lib/os/page";
import { Meeting } from "@/models/os/Meeting";
import { formatDateTime } from "@/lib/utils";
import { OsLink, OsPage, OsTable, Td, Th } from "@/components/os/ui";
import { RowDeleteButton } from "@/components/os/RowDeleteButton";
import { archiveMeeting } from "@/actions/os/meetings";
import { hasPermission } from "@/lib/os/permissions";

export default async function MeetingsPage() {
  const staff = await requireOsPage("meetings:read");
  const canWrite = hasPermission(staff.permissions, "meetings:write");
  const meetings = await Meeting.find({ recordStatus: "active" }).sort({ startsAt: -1 }).lean();
  return (
    <OsPage
      title="Meetings"
      backHref="/admin/os"
      backLabel="Back to dashboard"
      actions={canWrite ? <OsLink href="/admin/os/meetings/new">Add meeting</OsLink> : undefined}
    >
      <OsTable>
        <thead>
          <tr>
            <Th>Title</Th>
            <Th>When</Th>
            <Th>Type</Th>
            <Th>Delete</Th>
          </tr>
        </thead>
        <tbody>
          {meetings.map((m) => (
            <tr key={String(m._id)}>
              <Td>
                <Link href={`/admin/os/meetings/${m._id}`} className="text-[var(--dash-accent)]">
                  {m.title}
                </Link>
              </Td>
              <Td>{formatDateTime(m.startsAt)}</Td>
              <Td>{m.meetingType}</Td>
              <Td>
                {canWrite ? (
                  <RowDeleteButton
                    action={archiveMeeting}
                    id={String(m._id)}
                    confirmMessage={`Delete meeting "${m.title}"?`}
                  />
                ) : null}
              </Td>
            </tr>
          ))}
        </tbody>
      </OsTable>
    </OsPage>
  );
}
