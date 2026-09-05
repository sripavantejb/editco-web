export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { requireOsPage } from "@/lib/os/page";
import { Meeting } from "@/models/os/Meeting";
import { Conversion } from "@/models/os/Conversion";
import { updateMeeting } from "@/actions/os/meetings";
import { OsActionForm } from "@/components/os/OsActionForm";
import { Field, OsLink, OsPage, osInputClass, osTextareaClass } from "@/components/os/ui";
import { OsDateInput } from "@/components/os/OsDateInput";
import { OsSelect } from "@/components/os/OsSelect";
import { MEETING_TYPES } from "@/lib/os/constants";
import { formatDateTime } from "@/lib/utils";
import { hasPermission } from "@/lib/os/permissions";

export default async function MeetingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const staff = await requireOsPage("meetings:read");
  const { id } = await params;
  const meeting = await Meeting.findById(id).lean();
  if (!meeting) notFound();
  const conversion = await Conversion.findOne({ conversionUuid: meeting.conversionUuid }).lean();
  const canWrite = hasPermission(staff.permissions, "meetings:write");
  const local = new Date(meeting.startsAt);
  const localValue = new Date(local.getTime() - local.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  return (
    <OsPage
      title={meeting.title}
      subtitle={formatDateTime(meeting.startsAt)}
      backHref="/admin/os/meetings"
      backLabel="Back to meetings"
      actions={conversion ? <OsLink href={`/admin/os/c/${conversion.publicCode}`}>Hub</OsLink> : null}
    >      {canWrite ? (
        <OsActionForm action={updateMeeting} className="grid max-w-2xl gap-3">
      <input type="hidden" name="id" value={id} />
      <Field label="Title"><input name="title" defaultValue={meeting.title} className={osInputClass()} /></Field>
      <Field label="When">
        <OsDateInput name="startsAt" type="datetime-local" defaultValue={localValue} />
      </Field>
      <Field label="Type">
      <OsSelect name="meetingType" options={MEETING_TYPES.map((t) => ({ value: t, label: t }))} defaultValue={meeting.meetingType} />
      </Field>
      <Field label="Participants"><input name="participants" defaultValue={meeting.participants} className={osInputClass()} /></Field>
      <Field label="Discussion"><textarea name="discussion" defaultValue={meeting.discussion} className={osTextareaClass()} /></Field>
      <Field label="Decisions"><textarea name="decisions" defaultValue={meeting.decisions} className={osTextareaClass()} /></Field>
      <Field label="Action items"><textarea name="actionItems" defaultValue={meeting.actionItems} className={osTextareaClass()} /></Field>
      <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" name="visibleToClient" defaultChecked={meeting.visibleToClient} /> Visible to client
          </label>
      </OsActionForm>
      ) : (
        <div className="max-w-2xl space-y-3 font-inter text-sm">
      <p>{meeting.discussion}</p>
      <p>Decisions: {meeting.decisions}</p>
      <p>Actions: {meeting.actionItems}</p>
      </div>
      )}
    </OsPage>
  );
}
