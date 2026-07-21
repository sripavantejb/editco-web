export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { getAdminSession } from "@/lib/session";
import { Referral } from "@/models/Referral";
import { Referrer } from "@/models/Referrer";
import { ReferralActivity } from "@/models/ReferralActivity";
import { AdminNav } from "@/components/referral/AdminNav";
import { AdminStageForm } from "@/components/referral/AdminForms";
import { Card, CardDescription, CardTitle } from "@/components/referral/ui/card";
import { STAGE_LABELS, type Stage } from "@/lib/constants";
import { formatCurrencyINR, formatDateTime } from "@/lib/utils";

export default async function AdminReferralDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const { id } = await params;
  await connectDB();
  const referral = await Referral.findById(id).lean();
  if (!referral) notFound();

  const [referrer, activity] = await Promise.all([
    Referrer.findById(referral.referrerId).lean(),
    ReferralActivity.find({ referralId: referral._id })
      .sort({ createdAt: -1 })
      .lean(),
  ]);

  return (
    <div className="min-h-screen">
      <AdminNav email={session.email} />
      <main className="mx-auto grid max-w-[1600px] gap-6 px-4 py-8 sm:px-6 lg:px-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <div>
            <Link
              href="/admin/referrals"
              className="text-sm text-white/40 hover:text-white/70"
            >
              ← All referrals
            </Link>
            <h1 className="font-archivo mt-3 text-3xl uppercase tracking-tighter text-white">
              {referral.referredName}
            </h1>
            <p className="mt-1 text-white/50">
              {referral.referredBusiness || "No business"} ·{" "}
              {STAGE_LABELS[referral.stage as Stage]}
            </p>
          </div>

          <Card className="space-y-3 font-inter text-sm text-white/70">
            <CardTitle>Lead details</CardTitle>
            <p>Email: {referral.referredEmail || "—"}</p>
            <p>Phone: {referral.referredPhone || "—"}</p>
            <p>Needs: {referral.referredNeeds || "—"}</p>
            <p>Referrer notes: {referral.referrerNotes || "—"}</p>
            <p>
              Source:{" "}
              {referral.source === "manual_submission" ? "Manual" : "Link click"}
            </p>
            {referral.rewardAmount != null && (
              <p>
                Reward: {formatCurrencyINR(referral.rewardAmount)} (
                {referral.rewardStatus})
              </p>
            )}
          </Card>

          <Card className="space-y-3 font-inter text-sm text-white/70">
            <CardTitle>Attribution</CardTitle>
            <p>UTM source: {referral.utmSource || "—"}</p>
            <p>UTM medium: {referral.utmMedium || "—"}</p>
            <p>UTM campaign: {referral.utmCampaign || "—"}</p>
            <p>Landing page: {referral.landingPage || "—"}</p>
            <p>
              First click:{" "}
              {referral.firstClickAt
                ? formatDateTime(referral.firstClickAt)
                : "—"}
            </p>
          </Card>

          <Card className="space-y-3 font-inter text-sm text-white/70">
            <CardTitle>Referrer</CardTitle>
            <p>
              {referrer?.fullName} ({referrer?.email})
            </p>
            <p>Code: {referrer?.referralCode}</p>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardTitle className="mb-4">Update stage</CardTitle>
            <AdminStageForm
              referralId={String(referral._id)}
              currentStage={referral.stage as Stage}
            />
          </Card>

          <Card>
            <CardTitle className="mb-4">Activity</CardTitle>
            <div className="space-y-3">
              {activity.map((a) => (
                <div
                  key={String(a._id)}
                  className="border-l-2 border-gaude-orange/40 pl-3 text-sm"
                >
                  <p className="text-white/90">
                    {a.eventType.replace("_", " ")}
                    {a.fromStage && a.toStage
                      ? `: ${a.fromStage} → ${a.toStage}`
                      : ""}
                  </p>
                  {a.note && <p className="text-white/50">{a.note}</p>}
                  <p className="text-xs text-white/30">
                    {a.createdBy} · {formatDateTime(a.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
