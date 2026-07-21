export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { getAdminSession } from "@/lib/session";
import { Referrer } from "@/models/Referrer";
import { Referral } from "@/models/Referral";
import {
  AdminOverviewPanel,
  type OverviewReferral,
  type OverviewReferrer,
} from "@/components/referral/AdminOverviewPanel";
import type { Stage, Tier } from "@/lib/constants";
import { formatCurrencyINR } from "@/lib/utils";

export default async function AdminOverviewPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  await connectDB();
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [referrers, referrals, monthReferrals] = await Promise.all([
    Referrer.find().sort({ createdAt: -1 }).lean(),
    Referral.find().sort({ updatedAt: -1 }).lean(),
    Referral.find({ createdAt: { $gte: startOfMonth } }).lean(),
  ]);

  const won = referrals.filter((r) => r.stage === "won");
  const conversionRate =
    referrals.length === 0
      ? 0
      : Math.round((won.length / referrals.length) * 100);
  const pendingRewards = won
    .filter((r) => r.rewardStatus === "pending")
    .reduce((sum, r) => sum + (r.rewardAmount || 0), 0);
  const paidRewards = won
    .filter((r) => r.rewardStatus === "paid")
    .reduce((sum, r) => sum + (r.rewardAmount || 0), 0);

  const referralCountByReferrer = referrals.reduce<Record<string, number>>(
    (acc, r) => {
      const id = String(r.referrerId);
      acc[id] = (acc[id] || 0) + 1;
      return acc;
    },
    {}
  );

  const overviewReferrers: OverviewReferrer[] = referrers.map((r) => ({
    id: String(r._id),
    fullName: r.fullName,
    email: r.email,
    tier: r.tier as Tier,
    successfulReferralCount: r.successfulReferralCount || 0,
    totalRewardEarned: r.totalRewardEarned || 0,
    totalRewardPaid: r.totalRewardPaid || 0,
    referralCount: referralCountByReferrer[String(r._id)] || 0,
  }));

  const overviewReferrals: OverviewReferral[] = referrals.map((r) => ({
    id: String(r._id),
    referrerId: String(r.referrerId),
    referredName: r.referredName,
    referredBusiness: r.referredBusiness || null,
    source: r.source,
    stage: r.stage as Stage,
    rewardStatus: r.rewardStatus || "not_applicable",
    utmSource: r.utmSource || null,
    utmMedium: r.utmMedium || null,
    utmCampaign: r.utmCampaign || null,
    createdAt:
      r.createdAt instanceof Date
        ? r.createdAt.toISOString()
        : String(r.createdAt),
  }));

  return (
    <main className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-10">
      <AdminOverviewPanel
        referrers={overviewReferrers}
        referrals={overviewReferrals}
        stats={{
          totalReferrers: referrers.length,
          monthReferrals: monthReferrals.length,
          conversionRate,
          paidRewards: formatCurrencyINR(paidRewards),
          pendingRewards: formatCurrencyINR(pendingRewards),
        }}
        monthStartIso={startOfMonth.toISOString()}
      />
    </main>
  );
}
