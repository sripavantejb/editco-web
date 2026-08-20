export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { requireOsPage } from "@/lib/os/page";
import { Conversion } from "@/models/os/Conversion";
import { Vendor } from "@/models/os/Vendor";
import { Invoice } from "@/models/os/Invoice";
import { isPublicCode } from "@/lib/os/conversion-id";
import { OsPage } from "@/components/os/ui";
import Link from "next/link";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireOsPage("search:read");
  const { q = "" } = await searchParams;
  const query = q.trim();
  if (!query) {
    return (
    <OsPage
        title="Search"
        subtitle="Paste a conversion code, company, email, or invoice number."
        backHref="/admin/os"
        backLabel="Back to dashboard"
      >
      <form className="max-w-xl">
      <input name="q" className="h-11 w-full rounded-xl border border-[var(--dash-border)] bg-[var(--dash-input)] px-3" placeholder="EC-2026-8F4A2C91" />
      </form>
      </OsPage>
    );
  }

  if (isPublicCode(query)) {
    const found = await Conversion.findOne({ publicCode: query.toUpperCase() }).lean();
    if (found) redirect(`/admin/os/c/${found.publicCode}`);
  }

  const uuidHit = await Conversion.findOne({ conversionUuid: query }).lean();
  if (uuidHit) redirect(`/admin/os/c/${uuidHit.publicCode}`);

  const invoice = await Invoice.findOne({
    invoiceNumber: new RegExp(`^${query}$`, "i"),
  }).lean();
  if (invoice) redirect(`/admin/os/invoices/${invoice._id}`);

  const vendors = await Vendor.find({
    $or: [
      { companyName: new RegExp(query, "i") },
      { email: new RegExp(query, "i") },
      { contactPerson: new RegExp(query, "i") },
    ],
  })
    .limit(20)
    .lean();

  const conversions = await Conversion.find({
    publicCode: new RegExp(query, "i"),
  })
    .limit(20)
    .lean();

  return (
    <OsPage
      title={`Search: ${query}`}
      backHref="/admin/os"
      backLabel="Back to dashboard"
    >
      <div className="space-y-6 font-inter text-sm">
      <section>
      <h2 className="mb-2 font-archivo text-xs uppercase">Conversions</h2>
          {conversions.map((c) => (
            <div key={String(c._id)}>
      <Link href={`/admin/os/c/${c.publicCode}`}>{c.publicCode}</Link>
      </div>
          ))}
          {conversions.length === 0 ? <p className="text-[var(--dash-muted)]">None</p> : null}
        </section>
      <section>
      <h2 className="mb-2 font-archivo text-xs uppercase">Clients</h2>
          {vendors.map((v) => (
            <div key={String(v._id)}>
      <Link href={`/admin/os/vendors/${v._id}`}>{v.companyName}</Link>
              {v.conversionUuid ? (
                <Link className="ml-2 text-[var(--dash-accent)]" href={`/admin/os/search?q=${v.conversionUuid}`}>
                  hub
                </Link>
              ) : null}
            </div>
          ))}
          {vendors.length === 0 ? <p className="text-[var(--dash-muted)]">None</p> : null}
        </section>
      </div>
      </OsPage>
  );
}
