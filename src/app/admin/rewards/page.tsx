export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { getAdminSession } from "@/lib/session";
import { Referral } from "@/models/Referral";
import { Referrer } from "@/models/Referrer";
import { MarkPaidButton } from "@/components/referral/AdminForms";
import { RewardsEmptyState } from "@/components/referral/RewardsEmptyState";
import { Card, CardDescription, CardTitle } from "@/components/referral/ui/card";
import { formatCurrencyINR } from "@/lib/utils";

export default async function AdminRewardsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  await connectDB();
  const pending = await Referral.find({
    stage: "won",
    rewardStatus: "pending",
  })
    .sort({ convertedAt: -1 })
    .lean();

  const referrers = await Referrer.find({
    _id: { $in: pending.map((p) => p.referrerId) },
  }).lean();
  const map = Object.fromEntries(referrers.map((r) => [String(r._id), r]));

  return (
    <main className="mx-auto max-w-[1600px] space-y-8 px-4 py-10 sm:px-6 lg:px-10">
      <div>
        <p className="font-archivo text-[10px] uppercase tracking-[0.22em] text-gaude-orange">
          Payouts
        </p>
        <h1 className="mt-2 font-archivo text-3xl uppercase tracking-tighter text-white sm:text-4xl">
          Pending rewards
        </h1>
        <p className="mt-2 font-inter text-sm text-white/45">
          Mark payouts as paid once transferred.
        </p>
      </div>

      {pending.length === 0 ? (
        <RewardsEmptyState />
      ) : (
        <div className="space-y-4">
          {pending.map((r) => {
            const ref = map[String(r.referrerId)];
            return (
              <Card
                key={String(r._id)}
                className="flex flex-col gap-4 transition hover:border-white/20 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <CardTitle className="normal-case tracking-normal">
                    {r.referredName}
                  </CardTitle>
                  <CardDescription className="mt-1 font-inter normal-case tracking-normal">
                    Referrer: {ref?.fullName} ·{" "}
                    {formatCurrencyINR(r.rewardAmount || 0)}
                  </CardDescription>
                </div>
                <MarkPaidButton referralId={String(r._id)} />
              </Card>
            );
          })}
        </div>
      )}
    </main>
  );
}
