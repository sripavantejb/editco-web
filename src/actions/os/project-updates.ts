"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { requireStaff } from "@/lib/os/guard";
import { logActivity } from "@/lib/os/activity";
import { str } from "@/lib/os/form";
import {
  VISIBILITY_LEVELS,
  type VisibilityLevel,
} from "@/lib/os/constants";
import { ProjectUpdate } from "@/models/os/ProjectUpdate";
import { Project } from "@/models/os/Project";
import type { ActionState } from "@/actions/auth";

function revalidateProject(projectId: string) {
  revalidatePath("/admin/os", "layout");
  revalidatePath(`/admin/os/projects/${projectId}`);
}

export async function createProjectUpdate(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const gate = await requireStaff("project_updates:write");
  if (!gate.ok) return { error: gate.error };
  await connectDB();

  const projectId = str(formData, "projectId");
  const project = await Project.findById(projectId);
  if (!project) return { error: "Project not found" };

  const title = str(formData, "title");
  if (!title) return { error: "Title is required" };

  const visibilityRaw = str(formData, "visibility") || "internal";
  const visibility = (VISIBILITY_LEVELS as readonly string[]).includes(visibilityRaw)
    ? (visibilityRaw as VisibilityLevel)
    : "internal";

  const publishNow = str(formData, "publish") === "on" || str(formData, "publish") === "true";

  const update = await ProjectUpdate.create({
    projectId: project._id,
    conversionUuid: project.conversionUuid,
    title,
    body: str(formData, "body"),
    visibility,
    publishedAt: publishNow || visibility === "client_visible" ? new Date() : undefined,
    createdBy: gate.staff.email,
    updatedBy: gate.staff.email,
  });

  await logActivity({
    title:
      visibility === "client_visible"
        ? "Client update published"
        : "Project update created",
    detail: title,
    createdBy: gate.staff.email,
    conversionUuid: project.conversionUuid,
    projectId: String(project._id),
    entityType: "project_update",
    entityId: String(update._id),
  });

  revalidateProject(String(project._id));
  return { success: "Update saved" };
}

export async function setProjectUpdateVisibility(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const gate = await requireStaff("project_updates:write");
  if (!gate.ok) return { error: gate.error };
  await connectDB();

  const update = await ProjectUpdate.findById(str(formData, "id"));
  if (!update) return { error: "Update not found" };

  const visibilityRaw = str(formData, "visibility");
  if (!(VISIBILITY_LEVELS as readonly string[]).includes(visibilityRaw)) {
    return { error: "Invalid visibility" };
  }

  update.visibility = visibilityRaw as VisibilityLevel;
  if (update.visibility === "client_visible" && !update.publishedAt) {
    update.publishedAt = new Date();
  }
  update.updatedBy = gate.staff.email;
  await update.save();

  await logActivity({
    title:
      update.visibility === "client_visible"
        ? "Client update published"
        : "Project update set internal",
    detail: update.title,
    createdBy: gate.staff.email,
    conversionUuid: update.conversionUuid || undefined,
    projectId: String(update.projectId),
    entityType: "project_update",
    entityId: String(update._id),
  });

  revalidateProject(String(update.projectId));
  return { success: "Visibility updated" };
}
