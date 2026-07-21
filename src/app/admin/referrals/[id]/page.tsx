export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  Calendar,
  Link2,
  MapPin,
} from "lucide-react";
import { connectDB } from "@/lib/db";
import { getAdminSession } from "@/lib/session";
import { Referral } from "@/models/Referral";
import { Referrer } from "@/models/Referrer";
import { ReferralActivity } from "@/models/ReferralActivity";
import { AdminStageForm, AdminEditReferralForm, AdminDeleteReferralButton, AdminEditReferrerForm } from "@/components/referral/AdminForms";
import { STAGE_LABELS, type Stage } from "@/lib/constants";
import { formatCurrencyINR, formatDateTime } from "@/lib/utils";

function AttrTile({
  label,
  value,
  icon: Icon,
  className = "",
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}) {
  return (
    <div
      className={`flex min-h-[88px] flex-col rounded-xl border border-white/10 bg-white/[0.02] p-3.5 ${className}`}
    >
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-3 w-3 text-white/30" />}
        <p className="font-archivo text-[10px] uppercase tracking-[0.16em] text-white/35">
          {label}
        </p>
      </div>
      <div className="mt-2 flex-1 font-inter text-sm leading-relaxed text-white/85 break-words">
        {value || <span className="text-white/30">—</span>}
      </div>
    </div>
  );
}

function StageBadge({ stage }: { stage: Stage }) {
  const tone =
    stage === "won"
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
      : stage === "lost"
        ? "border-red-500/30 bg-red-500/10 text-red-400"
        : "border-gaude-orange/35 bg-gaude-orange/10 text-gaude-orange";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 font-archivo text-[10px] uppercase tracking-widest ${tone}`}
    >
      {STAGE_LABELS[stage]}
    </span>
  );
}

function SectionCard({
  eyebrow,
  title,
  children,
  action,
}: {
  eyebrow?: string;
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="flex h-full min-h-0 flex-col rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-6">
      <div className="mb-5 flex h-10 shrink-0 items-start justify-between gap-3">
        <div>
          {eyebrow && (
            <p className="font-archivo text-[10px] uppercase tracking-[0.2em] text-gaude-orange">
              {eyebrow}
            </p>
          )}
          <h2
            className={`font-archivo text-sm uppercase tracking-[0.14em] text-white ${
              eyebrow ? "mt-1" : ""
            }`}
          >
            {title}
          </h2>
        </div>
        {action}
      </div>
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </section>
  );
}

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

  const stage = referral.stage as Stage;
  const sourceLabel =
    referral.source === "manual_submission" ? "Manual" : "Link click";
  const referrerInitial = (referrer?.fullName?.[0] || "R").toUpperCase();

  return (
    <main className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6 lg:px-10">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 font-archivo text-[10px] uppercase tracking-widest text-white/40 transition hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to overview
        </Link>

        <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <StageBadge stage={stage} />
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 font-archivo text-[10px] uppercase tracking-widest text-white/45">
                <Link2 className="h-3 w-3" />
                {sourceLabel}
              </span>
            </div>
            <h1 className="mt-3 font-archivo text-3xl uppercase tracking-tighter text-white sm:text-4xl">
              {referral.referredName}
            </h1>
            <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 font-inter text-sm text-white/45">
              {referral.referredBusiness ? (
                <span className="inline-flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-white/30" />
                  {referral.referredBusiness}
                </span>
              ) : (
                <span>No business listed</span>
              )}
              {referral.rewardAmount != null && (
                <>
                  <span className="text-white/20">·</span>
                  <span>
                    {formatCurrencyINR(referral.rewardAmount)}{" "}
                    <span className="text-white/30">
                      ({referral.rewardStatus})
                    </span>
                  </span>
                </>
              )}
            </p>
          </div>

          {referrer && (
            <div className="flex h-[72px] w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 lg:w-[280px]">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gaude-orange/15 font-archivo text-sm text-gaude-orange">
                {referrerInitial}
              </span>
              <div className="min-w-0">
                <p className="font-archivo text-[10px] uppercase tracking-[0.16em] text-white/35">
                  Referrer
                </p>
                <p className="truncate font-inter text-sm text-white">
                  {referrer.fullName}
                </p>
                <p className="truncate font-inter text-xs text-white/40">
                  {referrer.referralCode}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Equal card grid */}
      <div className="grid gap-5 lg:grid-cols-2">
        <SectionCard eyebrow="Lead" title="Edit contact & details">
          <AdminEditReferralForm
            referral={{
              id: String(referral._id),
              referredName: referral.referredName,
              referredBusiness: referral.referredBusiness,
              referredEmail: referral.referredEmail,
              referredPhone: referral.referredPhone,
              referredNeeds: referral.referredNeeds,
              referrerNotes: referral.referrerNotes,
              rewardAmount: referral.rewardAmount,
              rewardStatus: referral.rewardStatus || "not_applicable",
              flaggedDuplicate: Boolean(referral.flaggedDuplicate),
              utmSource: referral.utmSource,
              utmMedium: referral.utmMedium,
              utmCampaign: referral.utmCampaign,
              landingPage: referral.landingPage,
              adminInternalNotes: referral.adminInternalNotes,
            }}
          />
          <AdminDeleteReferralButton
            referralId={String(referral._id)}
            referredName={referral.referredName}
          />
        </SectionCard>

        <SectionCard eyebrow="Pipeline" title="Update stage">
          <AdminStageForm
            referralId={String(referral._id)}
            currentStage={stage}
          />
        </SectionCard>

        {referrer && (
          <SectionCard eyebrow="Partner" title="Edit referrer">
            <AdminEditReferrerForm
              referrer={{
                id: String(referrer._id),
                fullName: referrer.fullName,
                email: referrer.email,
                phone: referrer.phone,
                referralCode: referrer.referralCode,
                tier: referrer.tier,
                isPublicPartner: Boolean(referrer.isPublicPartner),
              }}
            />
          </SectionCard>
        )}

        <SectionCard eyebrow="Tracking" title="Attribution snapshot">
          <div className="grid h-full grid-cols-2 gap-3 content-start">
            <AttrTile label="UTM source" value={referral.utmSource} />
            <AttrTile label="UTM medium" value={referral.utmMedium} />
            <AttrTile label="UTM campaign" value={referral.utmCampaign} />
            <AttrTile
              icon={Calendar}
              label="First click"
              value={
                referral.firstClickAt
                  ? formatDateTime(referral.firstClickAt)
                  : null
              }
            />
            <AttrTile
              icon={MapPin}
              label="Landing page"
              className="col-span-2"
              value={
                referral.landingPage ? (
                  <span className="break-all text-white/70">
                    {referral.landingPage}
                  </span>
                ) : null
              }
            />
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="History"
          title="Activity"
          action={
            <span className="font-archivo text-[10px] uppercase tracking-widest text-white/30">
              {activity.length}
            </span>
          }
        >
          {activity.length === 0 ? (
            <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-white/10 px-4 py-8 text-center font-inter text-sm text-white/35">
              No activity yet
            </div>
          ) : (
            <div className="relative flex-1 pl-1">
              <div className="absolute bottom-2 left-[11px] top-2 w-px bg-gradient-to-b from-gaude-orange/50 via-white/10 to-transparent" />
              {activity.map((a, i) => {
                const label = a.eventType.replace(/_/g, " ");
                const stageChange =
                  a.fromStage && a.toStage
                    ? `${STAGE_LABELS[a.fromStage as Stage] || a.fromStage} → ${STAGE_LABELS[a.toStage as Stage] || a.toStage}`
                    : null;
                return (
                  <div
                    key={String(a._id)}
                    className="relative flex gap-4 pb-5 last:pb-0"
                  >
                    <span
                      className={`relative z-10 mt-1.5 flex h-[9px] w-[9px] shrink-0 rounded-full ${
                        i === 0
                          ? "bg-gaude-orange shadow-[0_0_10px_rgba(200,245,66,0.55)]"
                          : "bg-white/25"
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-inter text-sm capitalize text-white/90">
                        {label}
                        {stageChange && (
                          <span className="text-white/50">
                            {" "}
                            · {stageChange}
                          </span>
                        )}
                      </p>
                      {a.note && (
                        <p className="mt-1 font-inter text-sm text-white/45">
                          {a.note}
                        </p>
                      )}
                      <p className="mt-1.5 font-inter text-[11px] text-white/30">
                        {a.createdBy} · {formatDateTime(a.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>
      </div>
    </main>
  );
}
