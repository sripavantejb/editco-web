export const dynamic = "force-dynamic";

import { requireSalesPage } from "@/lib/sales/page";
import { createSalesDeal } from "@/actions/sales/deals";
import { OsActionForm } from "@/components/os/OsActionForm";
import { Field, OsPage, osInputClass, osTextareaClass } from "@/components/os/ui";

export default async function NewSalesDealPage({
  searchParams,
}: {
  searchParams: Promise<{ leadId?: string }>;
}) {
  await requireSalesPage("sales.deals");
  const { leadId } = await searchParams;

  return (
    <OsPage title="New deal" subtitle="Create a pipeline opportunity." backHref="/sales/employee/deals" backLabel="Back to deals">
      <OsActionForm action={createSalesDeal} submitLabel="Create deal" className="grid max-w-xl gap-4">
        {leadId ? <input type="hidden" name="leadId" value={leadId} /> : null}
        <Field label="Deal name">
          <input name="dealName" required className={osInputClass()} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Value (₹)">
            <input name="value" type="number" min={0} className={osInputClass()} />
          </Field>
          <Field label="Probability %">
            <input name="probability" type="number" min={0} max={100} defaultValue={10} className={osInputClass()} />
          </Field>
        </div>
        <Field label="Expected close date">
          <input name="expectedCloseDate" type="date" className={osInputClass()} />
        </Field>
        <Field label="Notes">
          <textarea name="notes" className={osTextareaClass()} />
        </Field>
      </OsActionForm>
    </OsPage>
  );
}
