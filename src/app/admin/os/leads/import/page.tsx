export const dynamic = "force-dynamic";

import Link from "next/link";
import { requireOsPage } from "@/lib/os/page";
import { OsPage } from "@/components/os/ui";
import { LeadCsvImportForm } from "@/components/os/LeadCsvImportForm";

export default async function ImportLeadsPage() {
  await requireOsPage("leads:write");

  return (
    <OsPage
      title="Import leads"
      subtitle="Upload a CSV exported from Excel. Then call and update each lead from Calling or the Leads list."
      backHref="/admin/os/leads"
      backLabel="Back to leads"
      actions={
        <Link
          href="/admin/os/leads/import/template"
          className="inline-flex min-h-11 items-center rounded-full border border-[var(--dash-border)] px-5 font-archivo text-xs uppercase tracking-[0.08em] text-[var(--dash-text)] hover:border-[var(--dash-accent)] hover:text-[var(--dash-accent)]"
        >
          Download template
        </Link>
      }
    >
      <LeadCsvImportForm />
    </OsPage>
  );
}
