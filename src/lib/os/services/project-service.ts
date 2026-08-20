import {
  normalizeProjectStatus,
  type ProjectStatus,
} from "@/lib/os/constants";
import {
  canTransitionProject,
  projectTransitionReasonRequired,
} from "@/lib/os/transitions";
import { calculateMilestoneProgress } from "@/lib/os/services/milestone-service";
import { connectDB } from "@/lib/db";
import { Project } from "@/models/os/Project";
import { Milestone } from "@/models/os/Milestone";
import { LEGACY_PROJECT_STATUS_MAP } from "@/lib/os/constants";

export type ProjectStatusChangeInput = {
  from: ProjectStatus | string;
  to: ProjectStatus | string;
  reason?: string;
};

export type ProjectStatusChangeResult =
  | { ok: true; from: ProjectStatus; to: ProjectStatus }
  | { ok: false; error: string };

/** Validates project status transitions before persistence. */
export function validateProjectStatusChange(
  input: ProjectStatusChangeInput
): ProjectStatusChangeResult {
  const from = normalizeProjectStatus(input.from);
  const to = normalizeProjectStatus(input.to);

  if (!canTransitionProject(from, to)) {
    return { ok: false, error: `Cannot move project from ${from} to ${to}.` };
  }

  if (projectTransitionReasonRequired(from, to) && !input.reason?.trim()) {
    return { ok: false, error: "A reason is required for this status change." };
  }

  return { ok: true, from, to };
}

/** One-shot normalize of legacy project.status values in MongoDB. */
export async function migrateLegacyProjectStatuses(): Promise<number> {
  await connectDB();
  let changed = 0;
  for (const [from, to] of Object.entries(LEGACY_PROJECT_STATUS_MAP)) {
    if (from === to) continue;
    const res = await Project.updateMany(
      { status: from },
      { $set: { status: to } }
    );
    changed += res.modifiedCount || 0;
  }
  return changed;
}

/** Recalculate Project.progress from active milestones (source of truth). */
export async function syncProjectProgressFromMilestones(
  projectId: string
): Promise<number> {
  await connectDB();
  const milestones = await Milestone.find({
    projectId,
    recordStatus: "active",
  })
    .select({ status: 1, weight: 1 })
    .lean();

  if (milestones.length === 0) {
    return -1; // signal: no milestones — keep manual progress
  }

  const progress = calculateMilestoneProgress(
    milestones.map((m) => ({
      status: m.status as "pending" | "in_progress" | "completed",
      weight: m.weight ?? 1,
    }))
  );

  await Project.updateOne(
    { _id: projectId },
    { $set: { progress } }
  );

  return progress;
}
