export const dynamic = "force-dynamic";

import { requireOsPage } from "@/lib/os/page";
import { Project } from "@/models/os/Project";
import { createMeeting } from "@/actions/os/meetings";
import { OsActionForm } from "@/components/os/OsActionForm";
import { Field, OsPage, osInputClass, osSelectClass, osTextareaClass } from "@/components/os/ui";
import { OsDateInput } from "@/components/os/OsDateInput";
import { MEETING_TYPES } from "@/lib/os/constants";

export default async function NewMeetingPage({
  searchParams,
}: {
  searchParams: Promise<{ projectId?: string }>;
}) {
  await requireOsPage("meetings:write");
  const { projectId } = await searchParams;
  const projects = await Project.find({ recordStatus: "active" }).lean();
  return (
    <OsPage title="Add meeting"
      backHref="/admin/os/meetings"
      backLabel="Back to meetings">
      <OsActionForm action={createMeeting} submitLabel="Save meeting" className="grid max-w-2xl gap-4">
      <Field label="Project">
      <select name="projectId" defaultValue={projectId} required className={osSelectClass()}>
      <option value="">Select</option>
            {projects.map((p) => (
              <option key={String(p._id)} value={String(p._id)}>{p.name}</option>
            ))}
          </select>
      </Field>
      <Field label="Title"><input name="title" required className={osInputClass()} /></Field>
      <Field label="Date and time">
        <OsDateInput name="startsAt" type="datetime-local" required />
      </Field>
      <Field label="Type">
      <select name="meetingType" className={osSelectClass()}>
            {MEETING_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
      </Field>
      <Field label="Participants"><input name="participants" placeholder="Editco Team, Client Team" className={osInputClass()} /></Field>
      <Field label="Discussion"><textarea name="discussion" className={osTextareaClass()} /></Field>
      <Field label="Decisions"><textarea name="decisions" className={osTextareaClass()} /></Field>
      <Field label="Action items"><textarea name="actionItems" className={osTextareaClass()} /></Field>
      <Field label="Next follow-up">
        <OsDateInput name="nextFollowUp" />
      </Field>
      <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" name="visibleToClient" /> Visible to client
        </label>
      </OsActionForm>
      </OsPage>
  );
}
