export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { getReferrerSession } from "@/lib/session";
import { Referrer } from "@/models/Referrer";
import { Referral } from "@/models/Referral";
import { ReferralClick } from "@/models/ReferralClick";
import { ReferralActivity } from "@/models/ReferralActivity";
import { DashboardNav } from "@/components/referral/DashboardNav";
import {
  DashboardClient,
  type DashboardReferral,
} from "@/components/referral/DashboardClient";
import type { Stage, Tier } from "@/lib/constants";

export default async function DashboardPage() {
  const session = await getReferrerSession();
  if (!session) redirect("/refer");

  await connectDB();
  const referrer = await Referrer.findById(session.referrerId).lean();
  if (!referrer) redirect("/refer");

  const referrals = await Referral.find({ referrerId: referrer._id })
    .sort({ updatedAt: -1 })
    .lean();

  const referralIds = referrals.map((r) => r._id);
  const notes = await ReferralActivity.find({
    referralId: { $in: referralIds },
    referrerVisible: true,
    note: { $exists: true, $nin: [null, ""] },
    eventType: { $in: ["stage_change", "note_added", "reward_calculated"] },
  })
    .sort({ createdAt: -1 })
    .lean();

  const latestNoteByReferral = new Map<string, { note: string; at: Date }>();
  for (const n of notes) {
    const key = String(n.referralId);
    if (!latestNoteByReferral.has(key) && n.note) {
      latestNoteByReferral.set(key, { note: n.note, at: n.createdAt });
    }
  }

  const clicks = await ReferralClick.find({
    referralCode: referrer.referralCode,
  }).lean();

  const clicksBySource = clicks.reduce<Record<string, number>>((acc, c) => {
    const key = c.utmSource || "unknown";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const converted = referrals.filter((r) => r.stage === "won").length;
  const inProgress = referrals.filter(
    (r) => !["won", "lost"].includes(r.stage)
  ).length;

  const dashboardReferrals: DashboardReferral[] = referrals.map((r) => {
    const note = latestNoteByReferral.get(String(r._id));
    return {
      id: String(r._id),
      referredName: r.referredName,
      referredBusiness: r.referredBusiness,
      source: r.source,
      stage: r.stage as Stage,
      lostReason: r.lostReason,
      rewardAmount: r.rewardAmount,
      rewardStatus: r.rewardStatus,
      updatedAt: new Date(r.updatedAt).toISOString(),
      latestNote: note?.note || null,
      latestNoteAt: note?.at ? new Date(note.at).toISOString() : null,
    };
  });

  return (
    <>
      <DashboardNav name={referrer.fullName} />
      <DashboardClient
        referrer={{
          fullName: referrer.fullName,
          referralCode: referrer.referralCode,
          tier: referrer.tier as Tier,
          isPublicPartner: Boolean(referrer.isPublicPartner),
        }}
        referrals={dashboardReferrals}
        clickTotal={clicks.length}
        clicksBySource={clicksBySource}
        stats={{
          total: referrals.length,
          converted,
          inProgress,
          earned: referrer.totalRewardEarned || 0,
        }}
      />
    </>
  );
}
