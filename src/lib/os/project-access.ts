import { connectDB } from "@/lib/db";
import { hasPermission } from "@/lib/os/permissions";
import type { StaffContext } from "@/lib/os/staff";
import { Project } from "@/models/os/Project";
import { ProjectMember } from "@/models/os/ProjectMember";
import type { Types } from "mongoose";

export function staffCanManageAllProjects(staff: StaffContext) {
  return (
    hasPermission(staff.permissions, "*") ||
    hasPermission(staff.permissions, "projects:write")
  );
}

export async function isProjectMember(
  projectId: string,
  userId: string
): Promise<boolean> {
  await connectDB();
  const member = await ProjectMember.findOne({
    projectId,
    userId,
  }).lean();
  if (member) return true;
  const project = await Project.findById(projectId).select("primaryPocUserId").lean();
  if (!project) return false;
  return project.primaryPocUserId
    ? String(project.primaryPocUserId) === userId
    : false;
}

export async function canViewProject(
  staff: StaffContext,
  project: { _id: Types.ObjectId | string; primaryPocUserId?: Types.ObjectId | string | null }
): Promise<boolean> {
  if (staffCanManageAllProjects(staff)) return true;
  if (!hasPermission(staff.permissions, "projects:read")) return false;
  const projectId = String(project._id);
  if (
    project.primaryPocUserId &&
    String(project.primaryPocUserId) === staff.userId
  ) {
    return true;
  }
  return isProjectMember(projectId, staff.userId);
}

export async function canManageProject(
  staff: StaffContext,
  project: { _id: Types.ObjectId | string; primaryPocUserId?: Types.ObjectId | string | null }
): Promise<boolean> {
  if (staffCanManageAllProjects(staff)) return true;
  if (!hasPermission(staff.permissions, "projects:write")) {
    // team_member / PM-lite: POC can manage assigned project ops for tasks
    if (
      project.primaryPocUserId &&
      String(project.primaryPocUserId) === staff.userId
    ) {
      return true;
    }
    return false;
  }
  return canViewProject(staff, project);
}

export async function ensureProjectMember(
  projectId: string,
  userId: string,
  createdBy: string,
  roleOnProject: "member" | "poc" = "member"
) {
  await connectDB();
  await ProjectMember.updateOne(
    { projectId, userId },
    {
      $setOnInsert: {
        projectId,
        userId,
        createdBy,
        roleOnProject,
      },
    },
    { upsert: true }
  );
}

export async function listProjectMemberIds(projectId: string): Promise<string[]> {
  await connectDB();
  const members = await ProjectMember.find({ projectId }).select("userId").lean();
  const project = await Project.findById(projectId).select("primaryPocUserId").lean();
  const ids = new Set(members.map((m) => String(m.userId)));
  if (project?.primaryPocUserId) ids.add(String(project.primaryPocUserId));
  return [...ids];
}

export async function projectIdsForStaff(staff: StaffContext): Promise<string[] | "all"> {
  if (staffCanManageAllProjects(staff)) return "all";
  await connectDB();
  const memberships = await ProjectMember.find({ userId: staff.userId })
    .select("projectId")
    .lean();
  const asPoc = await Project.find({ primaryPocUserId: staff.userId })
    .select("_id")
    .lean();
  const ids = new Set([
    ...memberships.map((m) => String(m.projectId)),
    ...asPoc.map((p) => String(p._id)),
  ]);
  return [...ids];
}
