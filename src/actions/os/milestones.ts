"use server";

import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { requireStaff } from "@/lib/os/guard";
import { logActivity } from "@/lib/os/activity";
import { bool, num, optDate, str } from "@/lib/os/form";
import {
  DEFAULT_PROJECT_MILESTONES,
  MILESTONE_STATUSES,
  type MilestoneStatus,
} from "@/lib/os/constants";
import { syncProjectProgressFromMilestones } from "@/lib/os/services/project-service";
import { Milestone } from "@/models/os/Milestone";
import { Project } from "@/models/os/Project";
import type { ActionState } from "@/actions/auth";

function revalidateProject(projectId: string) {
  revalidatePath("/admin/os", "layout");
  revalidatePath(`/admin/os/projects/${projectId}`);
}

export async function createMilestone(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const gate = await requireStaff("milestones:write");
  if (!gate.ok) return { error: gate.error };
  await connectDB();

  const projectId = str(formData, "projectId");
  const project = await Project.findById(projectId);
  if (!project || project.recordStatus !== "active") {
    return { error: "Project not found" };
  }

  const name = str(formData, "name");
  if (!name) return { error: "Milestone name is required" };

  const last = await Milestone.findOne({
    projectId: project._id,
    recordStatus: "active",
  })
    .sort({ sortOrder: -1 })
    .lean();

  const milestone = await Milestone.create({
    projectId: project._id,
    conversionUuid: project.conversionUuid,
    name,
    description: str(formData, "description"),
    sortOrder: (last?.sortOrder ?? -1) + 1,
    status: "pending",
    weight: Math.max(0.1, num(formData, "weight") || 1),
    dueDate: optDate(formData, "dueDate"),
    visibleToClient: bool(formData, "visibleToClient"),
    createdBy: gate.staff.email,
    updatedBy: gate.staff.email,
  });

  await syncProjectProgressFromMilestones(String(project._id));

  await logActivity({
    title: "Milestone created",
    detail: name,
    createdBy: gate.staff.email,
    conversionUuid: project.conversionUuid,
    projectId: String(project._id),
    entityType: "milestone",
    entityId: String(milestone._id),
  });

  revalidateProject(String(project._id));
  return { success: "Milestone added" };
}

export async function seedDefaultMilestones(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const gate = await requireStaff("milestones:write");
  if (!gate.ok) return { error: gate.error };
  await connectDB();

  const projectId = str(formData, "projectId");
  const project = await Project.findById(projectId);
  if (!project) return { error: "Project not found" };

  const existing = await Milestone.countDocuments({
    projectId: project._id,
    recordStatus: "active",
  });
  if (existing > 0) {
    return { error: "Project already has milestones" };
  }

  await Milestone.insertMany(
    DEFAULT_PROJECT_MILESTONES.map((name, index) => ({
      projectId: project._id,
      conversionUuid: project.conversionUuid,
      name,
      sortOrder: index,
      status: "pending",
      weight: 1,
      visibleToClient: true,
      createdBy: gate.staff.email,
      updatedBy: gate.staff.email,
    }))
  );

  await syncProjectProgressFromMilestones(String(project._id));

  await logActivity({
    title: "Default milestones seeded",
    detail: DEFAULT_PROJECT_MILESTONES.join(", "),
    createdBy: gate.staff.email,
    conversionUuid: project.conversionUuid,
    projectId: String(project._id),
    entityType: "project",
    entityId: String(project._id),
  });

  revalidateProject(String(project._id));
  return { success: "Default milestones added" };
}

export async function updateMilestoneStatus(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const gate = await requireStaff("milestones:write");
  if (!gate.ok) return { error: gate.error };
  await connectDB();

  const milestone = await Milestone.findById(str(formData, "id"));
  if (!milestone || milestone.recordStatus !== "active") {
    return { error: "Milestone not found" };
  }

  const status = str(formData, "status") as MilestoneStatus;
  if (!MILESTONE_STATUSES.includes(status)) {
    return { error: "Invalid status" };
  }

  const prev = milestone.status;
  milestone.status = status;
  milestone.completedAt = status === "completed" ? new Date() : undefined;
  milestone.updatedBy = gate.staff.email;
  await milestone.save();

  const progress = await syncProjectProgressFromMilestones(
    String(milestone.projectId)
  );

  await logActivity({
    title:
      status === "completed" ? "Milestone completed" : "Milestone status changed",
    detail: `${milestone.name}: ${prev} → ${status}${
      progress >= 0 ? ` · project ${progress}%` : ""
    }`,
    createdBy: gate.staff.email,
    conversionUuid: milestone.conversionUuid || undefined,
    projectId: String(milestone.projectId),
    entityType: "milestone",
    entityId: String(milestone._id),
  });

  revalidateProject(String(milestone.projectId));
  return { success: "Milestone updated" };
}

export async function updateMilestoneVisibility(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const gate = await requireStaff("milestones:write");
  if (!gate.ok) return { error: gate.error };
  await connectDB();

  const milestone = await Milestone.findById(str(formData, "id"));
  if (!milestone) return { error: "Milestone not found" };

  milestone.visibleToClient = bool(formData, "visibleToClient");
  milestone.updatedBy = gate.staff.email;
  await milestone.save();

  revalidateProject(String(milestone.projectId));
  return { success: "Visibility updated" };
}

export async function updateMilestoneDetails(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const gate = await requireStaff("milestones:write");
  if (!gate.ok) return { error: gate.error };
  await connectDB();

  const milestone = await Milestone.findById(str(formData, "id"));
  if (!milestone) return { error: "Milestone not found" };

  const name = str(formData, "name");
  if (name) milestone.name = name;
  milestone.description = str(formData, "description");
  if (formData.has("weight")) {
    milestone.weight = Math.max(0.1, num(formData, "weight") || 1);
  }
  milestone.dueDate = optDate(formData, "dueDate") || milestone.dueDate;
  if (formData.has("visibleToClient")) {
    milestone.visibleToClient = bool(formData, "visibleToClient");
  }
  milestone.updatedBy = gate.staff.email;
  await milestone.save();

  await syncProjectProgressFromMilestones(String(milestone.projectId));
  revalidateProject(String(milestone.projectId));
  return { success: "Milestone saved" };
}
