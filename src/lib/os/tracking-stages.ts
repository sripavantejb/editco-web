/** Client-safe tracking constants and pure helpers (no mongoose, no next/headers). */

import { normalizeProjectStatus, type ProjectStatus } from "@/lib/os/constants";

/**
 * Second factor for the tracking page. Codes are sequential (ECM2026001,
 * ECM2026002, ...) so they can be guessed by counting; flip this to true to
 * also require the client email on the record.
 */
export const TRACK_REQUIRE_EMAIL = false;

/** Tracking codes are shown with dashes but typed every which way. */
export function normalizeTrackingCode(raw: string) {
  return raw.trim().toUpperCase().replace(/\s+/g, "");
}

export function normalizeEmail(raw: string) {
  return raw.trim().toLowerCase();
}

export const TRACK_STAGES = [
  "confirmed",
  "onboarding",
  "in_production",
  "in_review",
  "delivered",
] as const;
export type TrackStage = (typeof TRACK_STAGES)[number];

export const TRACK_STAGE_LABELS: Record<TrackStage, string> = {
  confirmed: "Order confirmed",
  onboarding: "Onboarding",
  in_production: "In production",
  in_review: "In review",
  delivered: "Delivered",
};

export const TRACK_STAGE_BLURBS: Record<TrackStage, string> = {
  confirmed: "We received your go-ahead and opened your project file.",
  onboarding: "Collecting brand assets, briefs and access to get started.",
  in_production: "Our team is actively building your deliverables.",
  in_review: "Work is with you for feedback and approval.",
  delivered: "Everything is approved, delivered and wrapped up.",
};

/** Where the whole engagement sits — the furthest-along project wins. */
export function deriveStage(
  statuses: (string | null | undefined)[],
  hasProjects: boolean
): TrackStage {
  if (!hasProjects) return "confirmed";
  const normalized: ProjectStatus[] = statuses.map((s) => normalizeProjectStatus(s));
  const live = normalized.filter((s) => s !== "cancelled");
  if (live.length === 0) return "confirmed";
  if (live.every((s) => s === "completed")) return "delivered";
  if (live.some((s) => s === "in_review")) return "in_review";
  if (
    live.some(
      (s) => s === "in_progress" || s === "blocked" || s === "waiting_for_client"
    )
  ) {
    return "in_production";
  }
  if (live.some((s) => s === "onboarding" || s === "planned")) return "onboarding";
  return "confirmed";
}

export function stageIndex(stage: TrackStage) {
  return TRACK_STAGES.indexOf(stage);
}
