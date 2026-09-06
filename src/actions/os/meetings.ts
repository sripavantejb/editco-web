"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { requireStaff } from "@/lib/os/guard";
import { logActivity } from "@/lib/os/activity";
import { optDate, str } from "@/lib/os/form";
import { MEETING_TYPES, type MeetingType } from "@/lib/os/constants";
import { Meeting } from "@/models/os/Meeting";
import { Project } from "@/models/os/Project";
import { OsTask } from "@/models/os/Task";
import type { ActionState } from "@/actions/auth";

export async function createMeeting(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const gate = await requireStaff("meetings:write");
  if (!gate.ok) return { error: gate.error };
  await connectDB();
  const project = await Project.findById(str(formData, "projectId"));
  if (!project) return { error: "Project not found" };
  const startsAt = optDate(formData, "startsAt");
  if (!startsAt) return { error: "Date and time are required" };
  const title = str(formData, "title");
  if (!title) return { error: "Title is required" };

  const meetingType = (str(formData, "meetingType") || "other") as MeetingType;
  const meeting = await Meeting.create({
    conversionUuid: project.conversionUuid,
    projectId: project._id,
    vendorId: project.vendorId,
    title,
    startsAt,
    participants: str(formData, "participants"),
    meetingType: MEETING_TYPES.includes(meetingType) ? meetingType : "other",
    discussion: str(formData, "discussion"),
    decisions: str(formData, "decisions"),
    actionItems: str(formData, "actionItems"),
    nextFollowUp: optDate(formData, "nextFollowUp"),
    attachmentsNote: str(formData, "attachmentsNote"),
    visibleToClient: formData.has("visibleToClient"),
    createdBy: gate.staff.email,
    updatedBy: gate.staff.email,
  });

  const actionItems = str(formData, "actionItems");
  if (actionItems) {
    await OsTask.create({
      conversionUuid: project.conversionUuid,
      projectId: project._id,
      meetingId: meeting._id,
      title: `Follow-up: ${title}`,
      description: actionItems,
      assignee: str(formData, "participants"),
      dueDate: optDate(formData, "nextFollowUp"),
      createdBy: gate.staff.email,
      updatedBy: gate.staff.email,
    });
  }

  await logActivity({
    title: "Client meeting recorded",
    detail: title,
    createdBy: gate.staff.email,
    conversionUuid: project.conversionUuid,
    projectId: project._id.toString(),
    entityType: "meeting",
    entityId: meeting._id.toString(),
  });

  revalidatePath("/admin/os", "layout");
  redirect(`/admin/os/meetings/${meeting._id}`);
}

export async function updateMeeting(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const gate = await requireStaff("meetings:write");
  if (!gate.ok) return { error: gate.error };
  await connectDB();
  const meeting = await Meeting.findById(str(formData, "id"));
  if (!meeting) return { error: "Meeting not found" };
  meeting.title = str(formData, "title") || meeting.title;
  meeting.startsAt = optDate(formData, "startsAt") || meeting.startsAt;
  meeting.participants = str(formData, "participants");
  meeting.meetingType = (str(formData, "meetingType") ||
    meeting.meetingType) as MeetingType;
  meeting.discussion = str(formData, "discussion");
  meeting.decisions = str(formData, "decisions");
  meeting.actionItems = str(formData, "actionItems");
  meeting.nextFollowUp = optDate(formData, "nextFollowUp");
  meeting.attachmentsNote = str(formData, "attachmentsNote");
  meeting.visibleToClient = formData.has("visibleToClient");
  meeting.updatedBy = gate.staff.email;
  await meeting.save();
  revalidatePath("/admin/os", "layout");
  return { success: "Meeting saved" };
}

export async function archiveMeeting(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const gate = await requireStaff("meetings:write");
  if (!gate.ok) return { error: gate.error };
  await connectDB();
  const meeting = await Meeting.findById(str(formData, "id"));
  if (!meeting || meeting.recordStatus !== "active") {
    return { error: "Meeting not found" };
  }
  meeting.recordStatus = "archived";
  meeting.updatedBy = gate.staff.email;
  await meeting.save();
  await logActivity({
    title: "Meeting deleted",
    detail: meeting.title,
    createdBy: gate.staff.email,
    conversionUuid: meeting.conversionUuid,
    projectId: meeting.projectId?.toString(),
    entityType: "meeting",
    entityId: meeting._id.toString(),
  });
  revalidatePath("/admin/os", "layout");
  revalidatePath("/admin/os/meetings");
  return { success: "Meeting deleted" };
}
