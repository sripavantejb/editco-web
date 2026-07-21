export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { getAdminSession } from "@/lib/session";
import { Referrer } from "@/models/Referrer";
import { Referral } from "@/models/Referral";
import { AdminNav } from "@/components/referral/AdminNav";
import { Card, CardDescription } from "@/components/referral/ui/card";
import { TIER_LABELS } from "@/lib/constants";
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
    Referral.find().lean(),
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

  return (
    <div className="min-h-screen">
      <AdminNav email={session.email} />
      <main className="mx-auto max-w-[1600px] space-y-8 px-4 py-8 sm:px-6 lg:px-10">
        <h1 className="font-archivo text-3xl uppercase tracking-tighter text-white">
          Overview
        </h1>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total referrers", value: String(referrers.length) },
            {
              label: "Referrals this month",
              value: String(monthReferrals.length),
            },
            { label: "Conversion rate", value: `${conversionRate}%` },
            {
              label: "Rewards paid / pending",
              value: `${formatCurrencyINR(paidRewards)} / ${formatCurrencyINR(pendingRewards)}`,
            },
          ].map((s) => (
            <Card key={s.label}>
              <CardDescription>{s.label}</CardDescription>
              <p className="mt-2 text-xl font-semibold text-white">{s.value}</p>
            </Card>
          ))}
        </div>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-archivo text-xl uppercase text-white">
              Referrers
            </h2>
            <Link href="/admin/referrals" className="text-sm text-gaude-orange">
              All referrals →
            </Link>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-white/5 text-white/50">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Tier</th>
                  <th className="px-4 py-3 font-medium">Wins</th>
                  <th className="px-4 py-3 font-medium">Earned</th>
                  <th className="px-4 py-3 font-medium">Paid</th>
                </tr>
              </thead>
              <tbody>
                {referrers.map((r) => (
                  <tr key={String(r._id)} className="border-t border-white/10">
                    <td className="px-4 py-3 text-white">
                      {r.fullName}
                      <div className="text-xs text-white/40">{r.email}</div>
                    </td>
                    <td className="px-4 py-3 text-white/70">
                      {TIER_LABELS[r.tier as keyof typeof TIER_LABELS]}
                    </td>
                    <td className="px-4 py-3 text-white/70">
                      {r.successfulReferralCount}
                    </td>
                    <td className="px-4 py-3 text-white/70">
                      {formatCurrencyINR(r.totalRewardEarned || 0)}
                    </td>
                    <td className="px-4 py-3 text-white/70">
                      {formatCurrencyINR(r.totalRewardPaid || 0)}
                    </td>
                  </tr>
                ))}
                {referrers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 sm:px-6 lg:px-10 text-center text-white/40">
                      No referrers yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
