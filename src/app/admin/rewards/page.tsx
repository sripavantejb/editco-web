export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { getAdminSession } from "@/lib/session";
import { Referral } from "@/models/Referral";
import { Referrer } from "@/models/Referrer";
import { AdminNav } from "@/components/referral/AdminNav";
import { MarkPaidButton } from "@/components/referral/AdminForms";
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
    <div className="min-h-screen">
      <AdminNav email={session.email} />
      <main className="mx-auto max-w-[1600px] space-y-6 px-4 py-8 sm:px-6 lg:px-10">
        <h1 className="font-archivo text-3xl uppercase tracking-tighter text-white">
          Pending rewards
        </h1>
        <p className="font-inter text-white/50">
          Mark payouts as paid once transferred.
        </p>

        {pending.length === 0 ? (
          <Card>
            <CardTitle>All clear</CardTitle>
            <CardDescription className="mt-2 font-inter normal-case tracking-normal">
              No pending rewards right now.
            </CardDescription>
          </Card>
        ) : (
          <div className="space-y-4">
            {pending.map((r) => {
              const ref = map[String(r.referrerId)];
              return (
                <Card
                  key={String(r._id)}
                  className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
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
    </div>
  );
}
