export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { getAdminSession } from "@/lib/session";
import { Referral } from "@/models/Referral";
import { Referrer } from "@/models/Referrer";
import { AdminNav } from "@/components/referral/AdminNav";
import { STAGE_LABELS, type Stage } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

export default async function AdminReferralsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const sp = await searchParams;
  await connectDB();

  const stage = typeof sp.stage === "string" ? sp.stage : undefined;
  const source = typeof sp.source === "string" ? sp.source : undefined;
  const utmSource =
    typeof sp.utm_source === "string" ? sp.utm_source : undefined;
  const q = typeof sp.q === "string" ? sp.q.trim() : undefined;

  const filter: Record<string, unknown> = {};
  if (stage) filter.stage = stage;
  if (source) filter.source = source;
  if (utmSource) filter.utmSource = utmSource;

  const referrals = await Referral.find(filter).sort({ updatedAt: -1 }).lean();
  const referrerIds = Array.from(
    new Set(referrals.map((r) => String(r.referrerId)))
  );
  const referrers = await Referrer.find({ _id: { $in: referrerIds } }).lean();
  const referrerMap = Object.fromEntries(
    referrers.map((r) => [String(r._id), r])
  );

  const filtered = q
    ? referrals.filter((r) => {
        const ref = referrerMap[String(r.referrerId)];
        const hay =
          `${r.referredName} ${r.referredBusiness || ""} ${ref?.fullName || ""}`.toLowerCase();
        return hay.includes(q.toLowerCase());
      })
    : referrals;

  return (
    <div className="min-h-screen">
      <AdminNav email={session.email} />
      <main className="mx-auto max-w-[1600px] space-y-6 px-4 py-8 sm:px-6 lg:px-10">
        <h1 className="font-archivo text-3xl uppercase tracking-tighter text-white">
          Referrals
        </h1>

        <form className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:grid-cols-2 lg:grid-cols-5">
          <input
            name="q"
            defaultValue={q || ""}
            placeholder="Search name/business"
            className="h-10 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white"
          />
          <select
            name="stage"
            defaultValue={stage || ""}
            className="h-10 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white"
          >
            <option value="" className="bg-gaude-black">
              All stages
            </option>
            {Object.entries(STAGE_LABELS).map(([value, label]) => (
              <option key={value} value={value} className="bg-gaude-black">
                {label}
              </option>
            ))}
          </select>
          <select
            name="source"
            defaultValue={source || ""}
            className="h-10 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white"
          >
            <option value="" className="bg-gaude-black">
              All sources
            </option>
            <option value="manual_submission" className="bg-gaude-black">
              Manual
            </option>
            <option value="link_click" className="bg-gaude-black">
              Link click
            </option>
          </select>
          <input
            name="utm_source"
            defaultValue={utmSource || ""}
            placeholder="UTM source"
            className="h-10 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white"
          />
          <button
            type="submit"
            className="h-10 rounded-full bg-gaude-orange font-archivo text-xs uppercase tracking-[0.08em] text-white"
          >
            Filter
          </button>
        </form>

        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-white/5 text-white/50">
              <tr>
                <th className="px-4 py-3 font-medium">Lead</th>
                <th className="px-4 py-3 font-medium">Referrer</th>
                <th className="px-4 py-3 font-medium">Source</th>
                <th className="px-4 py-3 font-medium">Stage</th>
                <th className="px-4 py-3 font-medium">UTM</th>
                <th className="px-4 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const ref = referrerMap[String(r.referrerId)];
                return (
                  <tr key={String(r._id)} className="border-t border-white/10">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/referrals/${r._id}`}
                        className="font-medium text-white hover:text-gaude-orange"
                      >
                        {r.referredName}
                      </Link>
                      <div className="text-xs text-white/40">
                        {r.referredBusiness || "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-white/70">
                      {ref?.fullName || "—"}
                    </td>
                    <td className="px-4 py-3 text-white/50">
                      {r.source === "manual_submission" ? "Manual" : "Link"}
                    </td>
                    <td className="px-4 py-3 text-white/70">
                      {STAGE_LABELS[r.stage as Stage]}
                    </td>
                    <td className="px-4 py-3 text-xs text-white/40">
                      {[r.utmSource, r.utmMedium, r.utmCampaign]
                        .filter(Boolean)
                        .join(" / ") || "—"}
                    </td>
                    <td className="px-4 py-3 text-white/50">
                      {formatDate(r.createdAt)}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 sm:px-6 lg:px-10 text-center text-white/40">
                    No referrals match
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
