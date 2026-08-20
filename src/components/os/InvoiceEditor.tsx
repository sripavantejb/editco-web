"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { ActionState } from "@/actions/auth";
import {
  InvoiceSheet,
  type InvoiceLineItem,
  type InvoiceSheetData,
} from "@/components/os/InvoiceSheet";
import { Field, osInputClass, osTextareaClass } from "@/components/os/ui";
import { OsDateInput } from "@/components/os/OsDateInput";
import { OsSelect } from "@/components/os/OsSelect";
import { Button } from "@/components/referral/ui/button";
import { DEFAULT_TAX_RATE } from "@/lib/os/constants";
import { downloadInvoicePdf } from "@/lib/os/invoice-pdf";

export type InvoiceEditorProject = {
  id: string;
  name: string;
  code: string;
  billTo: {
    name: string;
    address: string;
    email: string;
    phone: string;
    gst: string;
  };
};

export type InvoiceEditorInitial = {
  id?: string;
  invoiceNumber?: string;
  projectId?: string;
  issueDate?: string;
  dueDate?: string;
  taxRate?: number;
  discount?: number;
  status?: string;
  documentNote?: string;
  billToName?: string;
  billToAddress?: string;
  billToEmail?: string;
  billToPhone?: string;
  billToGst?: string;
  lineItems?: InvoiceLineItem[];
  requireReason?: boolean;
};

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : label}
    </Button>
  );
}

function emptyItems(count = 3): InvoiceLineItem[] {
  return Array.from({ length: count }, () => ({
    description: "",
    quantity: 1,
    unitPrice: 0,
  }));
}

export function InvoiceEditor({
  mode,
  action,
  projects = [],
  initial,
  submitLabel,
  extraActions,
}: {
  mode: "create" | "edit";
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  projects?: InvoiceEditorProject[];
  initial?: InvoiceEditorInitial;
  submitLabel: string;
  extraActions?: React.ReactNode;
}) {
  const [state, formAction] = useActionState(action, {} as ActionState);
  const sheetRef = useRef<HTMLDivElement>(null);
  const [pdfPending, startPdf] = useTransition();

  const initialProject = projects.find((p) => p.id === initial?.projectId);
  const [projectId, setProjectId] = useState(initial?.projectId || "");
  const [billToName, setBillToName] = useState(
    initial?.billToName ?? initialProject?.billTo.name ?? ""
  );
  const [billToAddress, setBillToAddress] = useState(
    initial?.billToAddress ?? initialProject?.billTo.address ?? ""
  );
  const [billToEmail, setBillToEmail] = useState(
    initial?.billToEmail ?? initialProject?.billTo.email ?? ""
  );
  const [billToPhone, setBillToPhone] = useState(
    initial?.billToPhone ?? initialProject?.billTo.phone ?? ""
  );
  const [billToGst, setBillToGst] = useState(
    initial?.billToGst ?? initialProject?.billTo.gst ?? ""
  );
  const [issueDate, setIssueDate] = useState(initial?.issueDate || "");
  const [dueDate, setDueDate] = useState(initial?.dueDate || "");
  const [taxRate, setTaxRate] = useState(
    initial?.taxRate ?? DEFAULT_TAX_RATE
  );
  const [discount, setDiscount] = useState(initial?.discount ?? 0);
  const [status, setStatus] = useState(initial?.status || "draft");
  const [documentNote, setDocumentNote] = useState(
    initial?.documentNote || ""
  );
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>(
    initial?.lineItems?.length
      ? [...initial.lineItems, ...emptyItems(Math.max(0, 3 - initial.lineItems.length))]
      : emptyItems(3)
  );

  function onProjectChange(id: string) {
    setProjectId(id);
    const project = projects.find((p) => p.id === id);
    if (!project) return;
    setBillToName(project.billTo.name);
    setBillToAddress(project.billTo.address);
    setBillToEmail(project.billTo.email);
    setBillToPhone(project.billTo.phone);
    setBillToGst(project.billTo.gst);
  }

  function updateItem(index: number, patch: Partial<InvoiceLineItem>) {
    setLineItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...patch } : item))
    );
  }

  function addItem() {
    setLineItems((prev) => [
      ...prev,
      { description: "", quantity: 1, unitPrice: 0 },
    ]);
  }

  const preview: InvoiceSheetData = useMemo(
    () => ({
      invoiceNumber: initial?.invoiceNumber,
      issueDate: issueDate || null,
      dueDate: dueDate || null,
      status,
      billToName,
      billToAddress,
      billToEmail,
      billToPhone,
      billToGst,
      lineItems,
      taxRate,
      discount,
      documentNote,
    }),
    [
      initial?.invoiceNumber,
      issueDate,
      dueDate,
      status,
      billToName,
      billToAddress,
      billToEmail,
      billToPhone,
      billToGst,
      lineItems,
      taxRate,
      discount,
      documentNote,
    ]
  );

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(420px,794px)]">
      <form action={formAction} className="space-y-4">
        {mode === "edit" && initial?.id ? (
          <input type="hidden" name="id" value={initial.id} />
        ) : null}

        {mode === "create" ? (
          <Field label="Project">
            <OsSelect
              name="projectId"
              required
              value={projectId}
              onChange={onProjectChange}
              placeholder="Select project"
              options={[
                { value: "", label: "Select project" },
                ...projects.map((p) => ({
                  value: p.id,
                  label: `${p.name} · ${p.code}`,
                })),
              ]}
            />
          </Field>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Issue date">
            <OsDateInput
              name="issueDate"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
            />
          </Field>
          <Field label="Due date">
            <OsDateInput
              name="dueDate"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </Field>
          <Field label="Tax rate">
            <input
              type="number"
              step="0.01"
              name="taxRate"
              value={taxRate}
              onChange={(e) => setTaxRate(Number(e.target.value) || 0)}
              className={osInputClass()}
            />
          </Field>
          <Field label="Discount (₹)">
            <input
              type="number"
              name="discount"
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value) || 0)}
              className={osInputClass()}
            />
          </Field>
        </div>

        <Field label="Status">
          <OsSelect
            name="status"
            value={status}
            onChange={setStatus}
            options={[
              { value: "draft", label: "Draft" },
              { value: "issued", label: "Issued" },
              ...(mode === "edit"
                ? [{ value: "cancelled", label: "Cancelled" }]
                : []),
            ]}
          />
        </Field>

        <div className="rounded-2xl border border-[var(--dash-border)] p-4 space-y-3">
          <p className="font-archivo text-xs uppercase tracking-[0.08em] text-[var(--dash-muted)]">
            Client / bill to
          </p>
          <Field label="Company / name">
            <input
              name="billToName"
              value={billToName}
              onChange={(e) => setBillToName(e.target.value)}
              className={osInputClass()}
            />
          </Field>
          <Field label="Address">
            <textarea
              name="billToAddress"
              value={billToAddress}
              onChange={(e) => setBillToAddress(e.target.value)}
              className={osTextareaClass()}
              rows={3}
            />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Email">
              <input
                name="billToEmail"
                type="email"
                value={billToEmail}
                onChange={(e) => setBillToEmail(e.target.value)}
                className={osInputClass()}
              />
            </Field>
            <Field label="Phone">
              <input
                name="billToPhone"
                value={billToPhone}
                onChange={(e) => setBillToPhone(e.target.value)}
                className={osInputClass()}
              />
            </Field>
          </div>
          <Field label="GSTIN">
            <input
              name="billToGst"
              value={billToGst}
              onChange={(e) => setBillToGst(e.target.value)}
              className={osInputClass()}
            />
          </Field>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="font-inter text-xs text-[var(--dash-muted)]">
              Line items
            </p>
            <button
              type="button"
              onClick={addItem}
              className="font-inter text-xs text-[var(--dash-accent)]"
            >
              Add line
            </button>
          </div>
          {lineItems.map((item, i) => (
            <div key={i} className="grid grid-cols-6 gap-2">
              <input
                name="itemDescription"
                placeholder="Description"
                value={item.description}
                onChange={(e) =>
                  updateItem(i, { description: e.target.value })
                }
                className={`col-span-3 ${osInputClass()}`}
              />
              <input
                name="itemQty"
                type="number"
                placeholder="Qty"
                value={item.quantity}
                onChange={(e) =>
                  updateItem(i, { quantity: Number(e.target.value) || 0 })
                }
                className={osInputClass()}
              />
              <input
                name="itemPrice"
                type="number"
                placeholder="Price"
                value={item.unitPrice || ""}
                onChange={(e) =>
                  updateItem(i, { unitPrice: Number(e.target.value) || 0 })
                }
                className={`col-span-2 ${osInputClass()}`}
              />
            </div>
          ))}
        </div>

        <Field label="Notes">
          <textarea
            name="documentNote"
            value={documentNote}
            onChange={(e) => setDocumentNote(e.target.value)}
            className={osTextareaClass()}
          />
        </Field>

        {initial?.requireReason ? (
          <Field label="Reason (required if total changes)">
            <input name="reason" className={osInputClass()} />
          </Field>
        ) : null}

        {state.error ? (
          <p className="text-sm text-red-400">{state.error}</p>
        ) : null}
        {state.success ? (
          <p className="text-sm text-emerald-400">{state.success}</p>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <Submit label={submitLabel} />
          <Button
            type="button"
            variant="outline"
            disabled={pdfPending}
            onClick={() =>
              startPdf(async () => {
                if (!sheetRef.current) return;
                await downloadInvoicePdf(
                  sheetRef.current,
                  initial?.invoiceNumber || "invoice"
                );
              })
            }
          >
            {pdfPending ? "Preparing…" : "Download PDF"}
          </Button>
          {extraActions}
        </div>
      </form>

      {/* Unscaled sheet for PDF capture (preview below is CSS-scaled). */}
      <div
        className="pointer-events-none fixed left-[-10000px] top-0"
        aria-hidden
      >
        <InvoiceSheet data={preview} sheetRef={sheetRef} />
      </div>

      <div className="xl:sticky xl:top-6 xl:self-start">
        <p className="mb-3 font-archivo text-xs uppercase tracking-[0.08em] text-[var(--dash-muted)]">
          Preview
        </p>
        <div className="overflow-auto rounded-[24px] border border-[var(--dash-border)] bg-[var(--dash-surface)] p-3 sm:p-4">
          <div className="mx-auto origin-top scale-[0.55] sm:scale-[0.65] lg:scale-[0.72] xl:scale-[0.78]">
            <InvoiceSheet data={preview} />
          </div>
        </div>
      </div>
    </div>
  );
}
