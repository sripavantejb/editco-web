export const dynamic = "force-dynamic";

import { requireSalesPage } from "@/lib/sales/page";
import { createSalesQuotation } from "@/actions/sales/quotations";
import { OsActionForm } from "@/components/os/OsActionForm";
import { Field, OsPage, osInputClass, osTextareaClass } from "@/components/os/ui";

export default async function NewSalesQuotationPage() {
  await requireSalesPage("docs.quotations");

  return (
    <OsPage title="New quotation" backHref="/sales/employee/quotations" backLabel="Back to quotations">
      <OsActionForm action={createSalesQuotation} submitLabel="Create quotation" className="grid max-w-xl gap-4">
        <Field label="Customer name">
          <input name="customerName" required className={osInputClass()} />
        </Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Item / service">
            <input name="itemName" required className={osInputClass()} />
          </Field>
          <Field label="Quantity">
            <input name="itemQuantity" type="number" min={1} defaultValue={1} className={osInputClass()} />
          </Field>
          <Field label="Price (₹)">
            <input name="itemPrice" type="number" min={0} className={osInputClass()} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Discount %">
            <input name="discountPercent" type="number" min={0} max={100} defaultValue={0} className={osInputClass()} />
          </Field>
          <Field label="Tax %">
            <input name="taxPercent" type="number" min={0} defaultValue={18} className={osInputClass()} />
          </Field>
        </div>
        <Field label="Valid until">
          <input name="validUntil" type="date" className={osInputClass()} />
        </Field>
        <Field label="Terms">
          <textarea name="terms" className={osTextareaClass()} />
        </Field>
        <Field label="Notes">
          <textarea name="notes" className={osTextareaClass()} />
        </Field>
      </OsActionForm>
    </OsPage>
  );
}
