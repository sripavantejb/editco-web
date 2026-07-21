export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";
import { getReferrerSession } from "@/lib/session";
import { DashboardNav } from "@/components/referral/DashboardNav";
import { NewReferralForm } from "@/components/referral/NewReferralForm";

export default async function NewReferralPage() {
  const session = await getReferrerSession();
  if (!session) redirect("/refer");

  return (
    <div className="min-h-screen">
      <DashboardNav name={session.fullName} />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-10">
        <Link
          href="/dashboard"
          className="font-inter text-sm text-white/40 transition hover:text-gaude-orange"
        >
          ← Back to dashboard
        </Link>
        <div className="mt-4 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-gaude-orange/10 via-white/[0.03] to-transparent p-6 sm:p-8">
          <p className="inline-flex items-center gap-2 rounded-full border border-gaude-orange/40 bg-gaude-orange/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-white">
            <span className="h-1.5 w-1.5 rounded-full bg-gaude-orange" />
            New lead
          </p>
          <h1 className="font-archivo mt-4 text-2xl uppercase tracking-tighter text-white sm:text-3xl">
            Add a referral
          </h1>
          <p className="mt-2 mb-6 font-inter text-sm text-white/50">
            Share who they are and how we can help. We&apos;ll keep you updated
            on the pipeline.
          </p>
          <NewReferralForm />
        </div>
      </main>
    </div>
  );
}
