import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import { Referrer } from "@/models/Referrer";
import { trackReferralClick } from "@/actions/admin";
import { AttributionCapture } from "@/components/referral/AttributionCapture";
import { LeadForm } from "@/components/referral/LeadForm";
import { Card, CardDescription, CardTitle } from "@/components/referral/ui/card";

export const dynamic = "force-dynamic";

export default async function ReferralCodePage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { code: rawCode } = await params;
  const sp = await searchParams;

  await connectDB();
  const code = rawCode.toUpperCase();
  const referrer = await Referrer.findOne({ referralCode: code }).lean();
  if (!referrer) notFound();

  const utmSource = typeof sp.utm_source === "string" ? sp.utm_source : undefined;
  const utmMedium = typeof sp.utm_medium === "string" ? sp.utm_medium : undefined;
  const utmCampaign =
    typeof sp.utm_campaign === "string" ? sp.utm_campaign : undefined;
  const landingPage = `/refer/${code}`;

  await trackReferralClick({
    code,
    utmSource,
    utmMedium,
    utmCampaign,
    landingPage,
  });

  return (
    <main id="main" className="mx-auto grid min-h-screen max-w-6xl gap-10 px-4 py-28 lg:grid-cols-2 lg:items-center">
      <AttributionCapture code={code} />
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-gaude-orange/40 bg-gaude-orange/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-white">
          <span className="h-1.5 w-1.5 rounded-full bg-gaude-orange" />
          Introduced by {referrer.fullName}
        </div>
        <h1 className="font-archivo mt-6 text-4xl uppercase leading-none tracking-tighter text-white sm:text-5xl">
          Grow with <span className="text-gaude-orange">Editco</span>
        </h1>
        <p className="mt-4 font-inter text-lg text-white/60">
          Websites, AI calling agents, CRM systems, and automations — built for
          clinics, startups, and local businesses.
        </p>
      </div>

      <Card className="border-white/10 bg-white/[0.03]">
        <CardTitle>Submit your details</CardTitle>
        <CardDescription className="mt-1 mb-5 font-inter normal-case tracking-normal">
          Your intro from {referrer.fullName} is already attached.
        </CardDescription>
        <LeadForm
          defaultCode={code}
          utmSource={utmSource}
          utmMedium={utmMedium}
          utmCampaign={utmCampaign}
          landingPage={landingPage}
        />
      </Card>
    </main>
  );
}
