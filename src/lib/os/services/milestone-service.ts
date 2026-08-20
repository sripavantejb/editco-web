import type { MilestoneStatus } from "@/lib/os/constants";

export type MilestoneProgressInput = {
  status: MilestoneStatus;
  weight?: number;
};

/** Derive project progress (0–100) from milestone completion weights. */
export function calculateMilestoneProgress(
  milestones: MilestoneProgressInput[]
): number {
  if (milestones.length === 0) return 0;
  const totalWeight = milestones.reduce((sum, m) => sum + (m.weight ?? 1), 0);
  if (totalWeight <= 0) return 0;
  const completedWeight = milestones
    .filter((m) => m.status === "completed")
    .reduce((sum, m) => sum + (m.weight ?? 1), 0);
  return Math.round((completedWeight / totalWeight) * 100);
}
