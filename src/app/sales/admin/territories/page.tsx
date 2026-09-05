export const dynamic = "force-dynamic";

import { requireSalesAdminPage } from "@/lib/sales/page";
import { SalesTerritory } from "@/models/sales/SalesTerritory";
import { createSalesTerritory } from "@/actions/sales/territories";
import { OsActionForm } from "@/components/os/OsActionForm";
import { SalesModal } from "@/components/sales/SalesModal";
import { OsSelect } from "@/components/os/OsSelect";
import { Field, OsPage, OsTable, Td, Th, osInputClass } from "@/components/os/ui";

const TYPE_OPTIONS = [
  { value: "city", label: "City" },
  { value: "state", label: "State" },
  { value: "region", label: "Region" },
  { value: "country", label: "Country" },
  { value: "custom", label: "Custom" },
];

export default async function SalesTerritoriesPage() {
  await requireSalesAdminPage();
  const territories = await SalesTerritory.find({}).sort({ name: 1 }).lean();

  return (
    <OsPage
      title="Territory Management"
      subtitle="Regions leads and customers can be assigned to."
      backHref="/sales/admin"
      backLabel="Back to dashboard"
      actions={
        <SalesModal triggerLabel="Add territory" title="Add territory">
          <OsActionForm action={createSalesTerritory} submitLabel="Add territory" className="grid gap-3">
            <Field label="Name">
              <input name="name" required className={osInputClass()} />
            </Field>
            <Field label="Type">
              <OsSelect name="type" options={TYPE_OPTIONS} defaultValue="custom" />
            </Field>
            <Field label="Description">
              <input name="description" className={osInputClass()} />
            </Field>
          </OsActionForm>
        </SalesModal>
      }
    >
      <OsTable>
        <thead>
          <tr><Th>Name</Th><Th>Type</Th><Th>Description</Th></tr>
        </thead>
        <tbody>
          {territories.map((t) => (
            <tr key={String(t._id)}>
              <Td>{t.name}</Td>
              <Td className="capitalize">{t.type}</Td>
              <Td>{t.description || "—"}</Td>
            </tr>
          ))}
        </tbody>
      </OsTable>
      {territories.length === 0 ? <p className="mt-6 font-inter text-sm text-[var(--dash-muted)]">No territories yet.</p> : null}
    </OsPage>
  );
}
