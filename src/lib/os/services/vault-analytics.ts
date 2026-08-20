import { Types } from "mongoose";
import {
  PITCH_FUNNEL_ORDER,
  PITCH_STATUSES,
  PITCH_WORKING_STATUSES,
  type PitchStatus,
} from "@/lib/os/constants";
import { LeadProjectPitch } from "@/models/os/LeadProjectPitch";

function rate(numerator: number, denominator: number): number {
  if (!denominator || denominator <= 0) return 0;
  return Math.round((numerator / denominator) * 1000) / 10;
}

export type VaultProjectAnalytics = {
  peoplePitched: number;
  pitchAttempts: number;
  byStatus: Record<PitchStatus, number>;
  interested: number;
  working: number;
  currentlyWorking: number;
  won: number;
  lost: number;
  dealsWon: number;
  uniqueClientsWon: number;
  conversionRate: number;
  interestRate: number;
  winRate: number;
  funnel: { status: PitchStatus; count: number }[];
};

function emptyAnalytics(): VaultProjectAnalytics {
  const byStatus = Object.fromEntries(
    PITCH_STATUSES.map((s) => [s, 0])
  ) as Record<PitchStatus, number>;
  return {
    peoplePitched: 0,
    pitchAttempts: 0,
    byStatus,
    interested: 0,
    working: 0,
    currentlyWorking: 0,
    won: 0,
    lost: 0,
    dealsWon: 0,
    uniqueClientsWon: 0,
    conversionRate: 0,
    interestRate: 0,
    winRate: 0,
    funnel: PITCH_FUNNEL_ORDER.map((status) => ({ status, count: 0 })),
  };
}

export async function getVaultProjectAnalytics(
  projectId: string
): Promise<VaultProjectAnalytics> {
  if (!Types.ObjectId.isValid(projectId)) return emptyAnalytics();
  const pid = new Types.ObjectId(projectId);

  const pitches = await LeadProjectPitch.find({
    projectId: pid,
    recordStatus: "active",
  })
    .select({ leadId: 1, status: 1, attemptCount: 1 })
    .lean();

  if (pitches.length === 0) return emptyAnalytics();

  const peopleSet = new Set(pitches.map((p) => String(p.leadId)));
  const byStatusLeads: Record<PitchStatus, Set<string>> = Object.fromEntries(
    PITCH_STATUSES.map((s) => [s, new Set<string>()])
  ) as Record<PitchStatus, Set<string>>;

  let pitchAttempts = 0;
  let dealsWon = 0;

  for (const p of pitches) {
    const leadKey = String(p.leadId);
    const status = p.status as PitchStatus;
    pitchAttempts += p.attemptCount || 1;
    if (PITCH_STATUSES.includes(status)) {
      byStatusLeads[status].add(leadKey);
    }
    if (status === "won") dealsWon += 1;
  }

  const byStatus = Object.fromEntries(
    PITCH_STATUSES.map((s) => [s, byStatusLeads[s].size])
  ) as Record<PitchStatus, number>;

  const peoplePitched = peopleSet.size;
  const interested = byStatus.interested;
  const working = byStatus.working;
  const won = byStatus.won;
  const lost = byStatus.lost;

  const currentlyWorkingLeads = new Set<string>();
  for (const s of PITCH_WORKING_STATUSES) {
    for (const id of byStatusLeads[s]) currentlyWorkingLeads.add(id);
  }

  return {
    peoplePitched,
    pitchAttempts,
    byStatus,
    interested,
    working,
    currentlyWorking: currentlyWorkingLeads.size,
    won,
    lost,
    dealsWon,
    uniqueClientsWon: won,
    conversionRate: rate(won, peoplePitched),
    interestRate: rate(interested, peoplePitched),
    winRate: rate(won, interested),
    funnel: [
      ...PITCH_FUNNEL_ORDER.map((status) => ({
        status,
        count: byStatus[status],
      })),
      { status: "lost" as PitchStatus, count: lost },
    ],
  };
}

export type VaultComparisonRow = {
  projectId: string;
  peoplePitched: number;
  interested: number;
  currentlyWorking: number;
  sold: number;
  conversionRate: number;
};

export async function getVaultProjectsComparison(
  projectIds: string[]
): Promise<Map<string, VaultComparisonRow>> {
  const map = new Map<string, VaultComparisonRow>();
  const valid = projectIds.filter((id) => Types.ObjectId.isValid(id));
  await Promise.all(
    valid.map(async (id) => {
      const a = await getVaultProjectAnalytics(id);
      map.set(id, {
        projectId: id,
        peoplePitched: a.peoplePitched,
        interested: a.interested,
        currentlyWorking: a.currentlyWorking,
        sold: a.uniqueClientsWon,
        conversionRate: a.conversionRate,
      });
    })
  );
  return map;
}
