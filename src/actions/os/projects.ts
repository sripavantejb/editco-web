"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { requireStaff } from "@/lib/os/guard";
import { logActivity, notifyStaff, writeAudit } from "@/lib/os/activity";
import { bool, num, optDate, str } from "@/lib/os/form";
import {
  DEFAULT_PROJECT_MILESTONES,
  PROJECT_PRIORITIES,
  PROJECT_STATUSES,
  normalizeProjectStatus,
  type ProjectPriority,
} from "@/lib/os/constants";
import {
  migrateLegacyProjectStatuses,
  syncProjectProgressFromMilestones,
  validateProjectStatusChange,
} from "@/lib/os/services/project-service";
import {
  canManageProject,
  canViewProject,
  ensureProjectMember,
  staffCanManageAllProjects,
} from "@/lib/os/project-access";
import { Project } from "@/models/os/Project";
import { ProjectMember } from "@/models/os/ProjectMember";
import { Vendor } from "@/models/os/Vendor";
import { Conversion } from "@/models/os/Conversion";
import { Milestone } from "@/models/os/Milestone";
import { StaffUser } from "@/models/os/StaffUser";
import { OsTask } from "@/models/os/Task";
import type { ActionState } from "@/actions/auth";

function revalidateProject(projectId: string, conversionUuid?: string) {
  revalidatePath("/admin/os", "layout");
  revalidatePath(`/admin/os/projects/${projectId}`);
  if (conversionUuid) {
    revalidatePath(`/admin/os/c`, "layout");
  }
}

export async function createProject(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const gate = await requireStaff("projects:write");
  if (!gate.ok) return { error: gate.error };
  await connectDB();
  await migrateLegacyProjectStatuses();

  const conversionUuid = str(formData, "conversionUuid");
  const vendor = await Vendor.findOne({ conversionUuid });
  const conversion = await Conversion.findOne({ conversionUuid });
  if (!vendor || !conversion) return { error: "Conversion / vendor not found" };

  const name = str(formData, "name");
  if (!name) return { error: "Project name is required" };

  const rawStatus = str(formData, "status") || "planned";
  const status = normalizeProjectStatus(rawStatus);
  if (!PROJECT_STATUSES.includes(status)) {
    return { error: "Invalid status" };
  }

  const priorityRaw = str(formData, "priority") || "medium";
  const priority = (PROJECT_PRIORITIES as readonly string[]).includes(priorityRaw)
    ? (priorityRaw as ProjectPriority)
    : "medium";

  const pocId = str(formData, "primaryPocUserId");
  let primaryPocUserId = undefined as undefined | string;
  let pocName = "";
  if (pocId) {
    const poc = await StaffUser.findOne({ _id: pocId, isActive: true });
    if (!poc) return { error: "Primary POC must be an active user" };
    primaryPocUserId = String(poc._id);
    pocName = poc.name || poc.email;
  }

  const project = await Project.create({
    conversionUuid,
    conversionId: conversion._id,
    vendorId: vendor._id,
    name,
    service: str(formData, "service"),
    description: str(formData, "description"),
    startDate: optDate(formData, "startDate"),
    expectedDelivery: optDate(formData, "expectedDelivery"),
    status,
    priority,
    primaryPocUserId: primaryPocUserId || undefined,
    projectManager: pocName,
    assignedTeam: "",
    budget: num(formData, "budget"),
    progress: 0,
    createdBy: gate.staff.email,
    updatedBy: gate.staff.email,
  });

  if (primaryPocUserId) {
    await ensureProjectMember(
      String(project._id),
      primaryPocUserId,
      gate.staff.email,
      "poc"
    );
  }
  // Creator is a member when they manage projects
  await ensureProjectMember(
    String(project._id),
    gate.staff.userId,
    gate.staff.email,
    primaryPocUserId === gate.staff.userId ? "poc" : "member"
  );

  if (bool(formData, "seedMilestones")) {
    await Milestone.insertMany(
      DEFAULT_PROJECT_MILESTONES.map((milestoneName, index) => ({
        projectId: project._id,
        conversionUuid,
        name: milestoneName,
        sortOrder: index,
        status: "pending",
        weight: 1,
        visibleToClient: true,
        createdBy: gate.staff.email,
        updatedBy: gate.staff.email,
      }))
    );
  }

  await logActivity({
    title: "Project created",
    detail: project.name,
    createdBy: gate.staff.email,
    actorUserId: gate.staff.userId,
    actorName: gate.staff.name,
    actionType: "PROJECT_CREATED",
    conversionUuid,
    vendorId: vendor._id.toString(),
    projectId: project._id.toString(),
    entityType: "project",
    entityId: project._id.toString(),
  });

  if (primaryPocUserId && pocName) {
    await logActivity({
      title: "Primary POC assigned",
      detail: pocName,
      createdBy: gate.staff.email,
      actorUserId: gate.staff.userId,
      actorName: gate.staff.name,
      actionType: "PROJECT_POC_CHANGED",
      conversionUuid,
      projectId: project._id.toString(),
      entityType: "project",
      entityId: project._id.toString(),
      metadata: { primaryPocUserId, pocName },
    });
  }

  revalidatePath("/admin/os", "layout");
  redirect(`/admin/os/projects/${project._id}`);
}

export async function updateProject(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const gate = await requireStaff("projects:write");
  if (!gate.ok) return { error: gate.error };
  await connectDB();
  await migrateLegacyProjectStatuses();

  const project = await Project.findById(str(formData, "id"));
  if (!project) return { error: "Project not found" };
  if (!(await canManageProject(gate.staff, project))) {
    return { error: "You do not have access to this project" };
  }

  const prevStatus = normalizeProjectStatus(project.status);
  const nextRaw = str(formData, "status");
  const nextStatus = nextRaw
    ? normalizeProjectStatus(nextRaw)
    : prevStatus;
  const reason = str(formData, "statusReason");

  if (nextStatus !== prevStatus) {
    const check = validateProjectStatusChange({
      from: prevStatus,
      to: nextStatus,
      reason,
    });
    if (!check.ok) return { error: check.error };
  }

  project.name = str(formData, "name") || project.name;
  project.service = str(formData, "service");
  project.description = str(formData, "description");
  project.startDate = optDate(formData, "startDate") || project.startDate;
  project.expectedDelivery =
    optDate(formData, "expectedDelivery") || project.expectedDelivery;
  const actual = optDate(formData, "actualCompletion");
  if (actual) project.actualCompletion = actual;
  if (nextStatus === "completed" && !project.actualCompletion) {
    project.actualCompletion = new Date();
  }

  project.status = nextStatus;
  const priorityRaw = str(formData, "priority");
  if (priorityRaw && (PROJECT_PRIORITIES as readonly string[]).includes(priorityRaw)) {
    project.priority = priorityRaw as ProjectPriority;
  }

  const pocId = str(formData, "primaryPocUserId");
  if (pocId && String(project.primaryPocUserId || "") !== pocId) {
    const poc = await StaffUser.findOne({ _id: pocId, isActive: true });
    if (!poc) return { error: "Primary POC must be an active user" };
    const prevPoc = project.primaryPocUserId
      ? String(project.primaryPocUserId)
      : "";
    project.primaryPocUserId = poc._id;
    project.projectManager = poc.name || poc.email;
    await ensureProjectMember(
      String(project._id),
      String(poc._id),
      gate.staff.email,
      "poc"
    );
    await logActivity({
      title: "Primary POC changed",
      detail: poc.name || poc.email,
      createdBy: gate.staff.email,
      actorUserId: gate.staff.userId,
      actorName: gate.staff.name,
      actionType: "PROJECT_POC_CHANGED",
      conversionUuid: project.conversionUuid,
      projectId: project._id.toString(),
      entityType: "project",
      entityId: project._id.toString(),
      metadata: { prevPoc, primaryPocUserId: String(poc._id) },
    });
    await notifyStaff({
      type: "project",
      title: `You are Primary POC for ${project.name}`,
      body: `${gate.staff.name} assigned you as Primary POC`,
      href: `/admin/os/projects/${project._id}`,
      conversionUuid: project.conversionUuid,
      recipientEmail: poc.email,
    });
  }

  project.budget = num(formData, "budget");

  const milestoneCount = await Milestone.countDocuments({
    projectId: project._id,
    recordStatus: "active",
  });
  if (milestoneCount === 0 && formData.has("progress")) {
    project.progress = Math.min(100, Math.max(0, num(formData, "progress")));
  }

  project.updatedBy = gate.staff.email;
  await project.save();

  if (milestoneCount > 0) {
    await syncProjectProgressFromMilestones(String(project._id));
  }

  if (nextStatus !== prevStatus) {
    await writeAudit({
      entityType: "project",
      entityId: String(project._id),
      conversionUuid: project.conversionUuid,
      field: "status",
      oldValue: prevStatus,
      newValue: nextStatus,
      reason: reason || "Status updated",
      createdBy: gate.staff.email,
    });
    await logActivity({
      title: "Project status changed",
      detail: `${prevStatus} → ${nextStatus}${reason ? ` · ${reason}` : ""}`,
      createdBy: gate.staff.email,
      actorUserId: gate.staff.userId,
      actorName: gate.staff.name,
      actionType: "PROJECT_UPDATED",
      conversionUuid: project.conversionUuid,
      projectId: project._id.toString(),
      entityType: "project",
      entityId: project._id.toString(),
    });
  } else {
    await logActivity({
      title: "Project updated",
      detail: `${project.name} · ${project.status}`,
      createdBy: gate.staff.email,
      actorUserId: gate.staff.userId,
      actorName: gate.staff.name,
      actionType: "PROJECT_UPDATED",
      conversionUuid: project.conversionUuid,
      projectId: project._id.toString(),
      entityType: "project",
      entityId: project._id.toString(),
    });
  }

  revalidateProject(String(project._id), project.conversionUuid);
  return { success: "Project saved" };
}

export async function setProjectPrimaryPoc(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const gate = await requireStaff("projects:write");
  if (!gate.ok) return { error: gate.error };
  await connectDB();
  const project = await Project.findById(str(formData, "projectId"));
  if (!project) return { error: "Project not found" };
  if (!(await canManageProject(gate.staff, project))) {
    return { error: "You do not have access to this project" };
  }
  const pocId = str(formData, "primaryPocUserId");
  const poc = await StaffUser.findOne({ _id: pocId, isActive: true });
  if (!poc) return { error: "Primary POC must be an active user" };

  project.primaryPocUserId = poc._id;
  project.projectManager = poc.name || poc.email;
  project.updatedBy = gate.staff.email;
  await project.save();
  await ensureProjectMember(
    String(project._id),
    String(poc._id),
    gate.staff.email,
    "poc"
  );

  await logActivity({
    title: "Primary POC changed",
    detail: poc.name || poc.email,
    createdBy: gate.staff.email,
    actorUserId: gate.staff.userId,
    actorName: gate.staff.name,
    actionType: "PROJECT_POC_CHANGED",
    conversionUuid: project.conversionUuid,
    projectId: project._id.toString(),
    entityType: "project",
    entityId: project._id.toString(),
  });
  await notifyStaff({
    type: "project",
    title: `You are Primary POC for ${project.name}`,
    body: `${gate.staff.name} assigned you as Primary POC`,
    href: `/admin/os/projects/${project._id}`,
    conversionUuid: project.conversionUuid,
    recipientEmail: poc.email,
  });

  revalidateProject(String(project._id), project.conversionUuid);
  return { success: "Primary POC updated" };
}

export async function addProjectMember(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const gate = await requireStaff("projects:write");
  if (!gate.ok) return { error: gate.error };
  await connectDB();
  const project = await Project.findById(str(formData, "projectId"));
  if (!project) return { error: "Project not found" };
  if (!(await canManageProject(gate.staff, project))) {
    return { error: "You do not have access to this project" };
  }
  const userId = str(formData, "userId");
  const user = await StaffUser.findOne({ _id: userId, isActive: true });
  if (!user) return { error: "User must be active" };

  await ensureProjectMember(
    String(project._id),
    userId,
    gate.staff.email,
    "member"
  );

  await logActivity({
    title: "Project member added",
    detail: user.name || user.email,
    createdBy: gate.staff.email,
    actorUserId: gate.staff.userId,
    actorName: gate.staff.name,
    actionType: "PROJECT_MEMBER_ADDED",
    conversionUuid: project.conversionUuid,
    projectId: project._id.toString(),
    entityType: "project",
    entityId: project._id.toString(),
    metadata: { userId },
  });
  await notifyStaff({
    type: "project",
    title: `Added to project ${project.name}`,
    body: `${gate.staff.name} added you as a project member`,
    href: `/admin/os/projects/${project._id}`,
    conversionUuid: project.conversionUuid,
    recipientEmail: user.email,
  });

  revalidateProject(String(project._id), project.conversionUuid);
  return { success: "Member added" };
}

export async function removeProjectMember(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const gate = await requireStaff("projects:write");
  if (!gate.ok) return { error: gate.error };
  await connectDB();
  const project = await Project.findById(str(formData, "projectId"));
  if (!project) return { error: "Project not found" };
  if (!(await canManageProject(gate.staff, project))) {
    return { error: "You do not have access to this project" };
  }

  const userId = str(formData, "userId");
  if (
    project.primaryPocUserId &&
    String(project.primaryPocUserId) === userId
  ) {
    return {
      error: "Assign a replacement Primary POC before removing the current POC",
    };
  }

  const openTasks = await OsTask.countDocuments({
    projectId: project._id,
    assignedToId: userId,
    recordStatus: "active",
    status: { $nin: ["completed", "cancelled"] },
  });
  const disposition = str(formData, "taskDisposition"); // reassign | keep
  const reassignTo = str(formData, "reassignToUserId");

  if (openTasks > 0 && !disposition) {
    return {
      error: `This member has ${openTasks} open task(s). Choose reassign or keep.`,
    };
  }

  if (openTasks > 0 && disposition === "reassign") {
    if (!reassignTo) return { error: "Select a user to reassign tasks to" };
    const target = await StaffUser.findOne({ _id: reassignTo, isActive: true });
    if (!target) return { error: "Reassign target must be active" };
    const memberExists = await ProjectMember.findOne({
      projectId: project._id,
      userId: reassignTo,
    });
    if (!memberExists && String(project.primaryPocUserId || "") !== reassignTo) {
      return { error: "Reassign target must be a project member" };
    }
    await OsTask.updateMany(
      {
        projectId: project._id,
        assignedToId: userId,
        recordStatus: "active",
        status: { $nin: ["completed", "cancelled"] },
      },
      {
        $set: {
          assignedToId: target._id,
          assignee: target.name || target.email,
          updatedBy: gate.staff.email,
        },
      }
    );
  }

  await ProjectMember.deleteOne({ projectId: project._id, userId });
  const removed = await StaffUser.findById(userId).select("name email").lean();

  await logActivity({
    title: "Project member removed",
    detail: removed?.name || removed?.email || userId,
    createdBy: gate.staff.email,
    actorUserId: gate.staff.userId,
    actorName: gate.staff.name,
    actionType: "PROJECT_MEMBER_REMOVED",
    conversionUuid: project.conversionUuid,
    projectId: project._id.toString(),
    entityType: "project",
    entityId: project._id.toString(),
    metadata: { userId, disposition, openTasks },
  });

  revalidateProject(String(project._id), project.conversionUuid);
  return { success: "Member removed" };
}

export async function archiveProject(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const gate = await requireStaff("projects:write");
  if (!gate.ok) return { error: gate.error };
  await connectDB();
  const id = str(formData, "id");
  const project = await Project.findById(id);
  if (!project || project.recordStatus !== "active") {
    return { error: "Project not found" };
  }
  if (!(await canManageProject(gate.staff, project))) {
    return { error: "You cannot delete this project" };
  }
  project.recordStatus = "archived";
  project.updatedBy = gate.staff.email;
  await project.save();
  await logActivity({
    title: "Project deleted",
    detail: project.name,
    createdBy: gate.staff.email,
    conversionUuid: project.conversionUuid,
    projectId: String(project._id),
    entityType: "project",
    entityId: String(project._id),
  });
  revalidateProject(String(project._id), project.conversionUuid);
  return { success: "Project deleted" };
}

export async function assertProjectReadable(
  staff: Parameters<typeof canViewProject>[0],
  projectId: string
) {
  const project = await Project.findById(projectId);
  if (!project) return { ok: false as const, error: "Project not found" };
  if (!(await canViewProject(staff, project))) {
    return { ok: false as const, error: "You do not have access to this project" };
  }
  return { ok: true as const, project };
}

export { staffCanManageAllProjects, canViewProject, canManageProject };
