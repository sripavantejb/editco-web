"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Plus, Trash2, Copy } from "lucide-react";
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
import { formatCurrencyINR } from "@/lib/utils";

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
  documentType?: "TAX INVOICE" | "INVOICE" | "QUOTATION";
  issueDate?: string;
  dueDate?: string;
  documentDate?: string;
  taxRate?: number;
  discount?: number;
  status?: string;
  documentNote?: string;
  remarks?: string;
  state?: string;
  stateCode?: string;
  placeOfSupply?: string;
  buyerRefNo?: string;
  paymentTerms?: string;
  isInterState?: boolean;

  billToName?: string;
  billToAddress?: string;
  billToEmail?: string;
  billToPhone?: string;
  billToGst?: string;
  billToPan?: string;
  billToState?: string;
  billToStateCode?: string;

  shipToName?: string;
  shipToAddress?: string;
  shipToGst?: string;
  shipToState?: string;
  shipToStateCode?: string;

  lineItems?: InvoiceLineItem[];
  requireReason?: boolean;
};

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="bg-[var(--dash-accent,#3b82f6)] hover:brightness-110 text-white font-medium px-5"
    >
      {pending ? "Saving..." : label}
    </Button>
  );
}

function emptyItems(count = 2): InvoiceLineItem[] {
  return Array.from({ length: count }, () => ({
    description: "",
    specifications: "",
    hsnSac: "998314",
    quantity: 1,
    uom: "Nos",
    unitPrice: 0,
    discountPercent: 0,
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
  const [documentType, setDocumentType] = useState<
    "TAX INVOICE" | "INVOICE" | "QUOTATION"
  >(initial?.documentType || "TAX INVOICE");

  // Bill To State
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
  const [billToPan, setBillToPan] = useState(initial?.billToPan || "");
  const [billToState, setBillToState] = useState(
    initial?.billToState || "Karnataka"
  );
  const [billToStateCode, setBillToStateCode] = useState(
    initial?.billToStateCode || "29"
  );

  // Ship To State
  const [shipToName, setShipToName] = useState(initial?.shipToName || "");
  const [shipToAddress, setShipToAddress] = useState(
    initial?.shipToAddress || ""
  );
  const [shipToGst, setShipToGst] = useState(initial?.shipToGst || "");
  const [shipToState, setShipToState] = useState(
    initial?.shipToState || "Karnataka"
  );
  const [shipToStateCode, setShipToStateCode] = useState(
    initial?.shipToStateCode || "29"
  );

  // Metadata
  const [issueDate, setIssueDate] = useState(initial?.issueDate || "");
  const [dueDate, setDueDate] = useState(initial?.dueDate || "");
  const [documentDate, setDocumentDate] = useState(
    initial?.documentDate || initial?.issueDate || ""
  );
  const [docState, setDocState] = useState(initial?.state || "Karnataka");
  const [docStateCode, setDocStateCode] = useState(
    initial?.stateCode || "29"
  );
  const [placeOfSupply, setPlaceOfSupply] = useState(
    initial?.placeOfSupply || "Karnataka"
  );
  const [buyerRefNo, setBuyerRefNo] = useState(initial?.buyerRefNo || "");
  const [paymentTerms, setPaymentTerms] = useState(
    initial?.paymentTerms || "100% Advance"
  );

  // Financials
  const [taxRate, setTaxRate] = useState(
    initial?.taxRate ?? DEFAULT_TAX_RATE
  );
  const [discount, setDiscount] = useState(initial?.discount ?? 0);
  const [isInterState, setIsInterState] = useState(
    initial?.isInterState || false
  );
  const [status, setStatus] = useState(initial?.status || "draft");
  const [remarks, setRemarks] = useState(
    initial?.remarks ||
      "Services delivered as per agreed project milestone and deliverables."
  );
  const [documentNote, setDocumentNote] = useState(
    initial?.documentNote || ""
  );

  // Line items
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>(
    initial?.lineItems?.length
      ? [
          ...initial.lineItems.map((item) => ({
            ...item,
            specifications: item.specifications || "",
            hsnSac: item.hsnSac || "998314",
            uom: item.uom || "Nos",
            discountPercent: item.discountPercent || 0,
          })),
          ...emptyItems(Math.max(0, 2 - initial.lineItems.length)),
        ]
      : emptyItems(2)
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

  function copyBillToShip() {
    setShipToName(billToName);
    setShipToAddress(billToAddress);
    setShipToGst(billToGst);
    setShipToState(billToState);
    setShipToStateCode(billToStateCode);
  }

  function updateItem(index: number, patch: Partial<InvoiceLineItem>) {
    setLineItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...patch } : item))
    );
  }

  function addItem() {
    setLineItems((prev) => [
      ...prev,
      {
        description: "",
        specifications: "",
        hsnSac: "998314",
        quantity: 1,
        uom: "Nos",
        unitPrice: 0,
        discountPercent: 0,
      },
    ]);
  }

  function removeItem(index: number) {
    if (lineItems.length <= 1) {
      setLineItems(emptyItems(1));
      return;
    }
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  }

  const preview: InvoiceSheetData = useMemo(
    () => ({
      documentType,
      invoiceNumber: initial?.invoiceNumber,
      issueDate: issueDate || null,
      dueDate: dueDate || null,
      documentDate: documentDate || issueDate || null,
      status,
      state: docState,
      stateCode: docStateCode,
      placeOfSupply,
      buyerRefNo,
      paymentTerms,
      billToName,
      billToAddress,
      billToEmail,
      billToPhone,
      billToGst,
      billToPan,
      billToState,
      billToStateCode,
      shipToName,
      shipToAddress,
      shipToGst,
      shipToState,
      shipToStateCode,
      lineItems,
      taxRate,
      discount,
      isInterState,
      remarks,
      documentNote,
    }),
    [
      documentType,
      initial?.invoiceNumber,
      issueDate,
      dueDate,
      documentDate,
      status,
      docState,
      docStateCode,
      placeOfSupply,
      buyerRefNo,
      paymentTerms,
      billToName,
      billToAddress,
      billToEmail,
      billToPhone,
      billToGst,
      billToPan,
      billToState,
      billToStateCode,
      shipToName,
      shipToAddress,
      shipToGst,
      shipToState,
      shipToStateCode,
      lineItems,
      taxRate,
      discount,
      isInterState,
      remarks,
      documentNote,
    ]
  );

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1.05fr)_minmax(460px,794px)] items-start">
      {/* Form Controls Column */}
      <form action={formAction} className="space-y-6">
        {mode === "edit" && initial?.id ? (
          <input type="hidden" name="id" value={initial.id} />
        ) : null}
        <input type="hidden" name="isInterState" value={String(isInterState)} />

        {/* Project Selector (Create Mode) */}
        {mode === "create" ? (
          <div className="rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-surface,#18181b)] p-4 shadow-sm">
            <Field label="Target Project">
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
          </div>
        ) : null}

        {/* General Details & Metadata */}
        <div className="rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-surface,#18181b)] p-4 space-y-3.5 shadow-sm">
          <div className="flex items-center justify-between border-b border-[var(--dash-border)] pb-2">
            <p className="font-archivo text-xs uppercase tracking-[0.08em] text-[var(--dash-muted)] font-semibold">
              Document & Supply Details
            </p>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 text-xs text-[var(--dash-muted)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={isInterState}
                  onChange={(e) => setIsInterState(e.target.checked)}
                  className="rounded border-[var(--dash-border)] text-blue-500 focus:ring-0"
                />
                <span>Inter-state (IGST)</span>
              </label>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Document Type">
              <OsSelect
                name="documentType"
                value={documentType}
                onChange={(v) =>
                  setDocumentType(v as "TAX INVOICE" | "INVOICE" | "QUOTATION")
                }
                options={[
                  { value: "TAX INVOICE", label: "Tax Invoice (GST)" },
                  { value: "INVOICE", label: "Commercial Invoice" },
                  { value: "QUOTATION", label: "Quotation / Estimate" },
                ]}
              />
            </Field>
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
            <Field label="Payment Terms">
              <input
                name="paymentTerms"
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                placeholder="e.g. 100% Advance"
                className={osInputClass()}
              />
            </Field>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="Issue Date">
              <OsDateInput
                name="issueDate"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
              />
            </Field>
            <Field label="Due Date">
              <OsDateInput
                name="dueDate"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </Field>
            <Field label="Document Date">
              <OsDateInput
                name="documentDate"
                value={documentDate}
                onChange={(e) => setDocumentDate(e.target.value)}
              />
            </Field>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="State">
              <input
                name="state"
                value={docState}
                onChange={(e) => setDocState(e.target.value)}
                placeholder="Karnataka"
                className={osInputClass()}
              />
            </Field>
            <Field label="State Code">
              <input
                name="stateCode"
                value={docStateCode}
                onChange={(e) => setDocStateCode(e.target.value)}
                placeholder="29"
                className={osInputClass()}
              />
            </Field>
            <Field label="Place of Supply">
              <input
                name="placeOfSupply"
                value={placeOfSupply}
                onChange={(e) => setPlaceOfSupply(e.target.value)}
                placeholder="Karnataka"
                className={osInputClass()}
              />
            </Field>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Buyer Ref / PO No.">
              <input
                name="buyerRefNo"
                value={buyerRefNo}
                onChange={(e) => setBuyerRefNo(e.target.value)}
                placeholder="e.g. PO-2026-9812"
                className={osInputClass()}
              />
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="GST Rate (Decimal)">
                <input
                  type="number"
                  step="0.01"
                  name="taxRate"
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value) || 0)}
                  className={osInputClass()}
                />
              </Field>
              <Field label="Overall Disc (₹)">
                <input
                  type="number"
                  name="discount"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                  className={osInputClass()}
                />
              </Field>
            </div>
          </div>
        </div>

        {/* Client / Bill To Box */}
        <div className="rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-surface,#18181b)] p-4 space-y-3.5 shadow-sm">
          <div className="flex items-center justify-between border-b border-[var(--dash-border)] pb-2">
            <p className="font-archivo text-xs uppercase tracking-[0.08em] text-[var(--dash-muted)] font-semibold">
              Customer / Bill To
            </p>
          </div>

          <Field label="Company / Client Name">
            <input
              name="billToName"
              value={billToName}
              onChange={(e) => setBillToName(e.target.value)}
              placeholder="Client or Company Name"
              className={osInputClass()}
            />
          </Field>

          <Field label="Billing Address">
            <textarea
              name="billToAddress"
              value={billToAddress}
              onChange={(e) => setBillToAddress(e.target.value)}
              placeholder="Full address"
              className={osTextareaClass()}
              rows={2}
            />
          </Field>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Billing Email">
              <input
                name="billToEmail"
                type="email"
                value={billToEmail}
                onChange={(e) => setBillToEmail(e.target.value)}
                placeholder="billing@company.com"
                className={osInputClass()}
              />
            </Field>
            <Field label="Phone">
              <input
                name="billToPhone"
                value={billToPhone}
                onChange={(e) => setBillToPhone(e.target.value)}
                placeholder="+91-..."
                className={osInputClass()}
              />
            </Field>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="GSTIN">
              <input
                name="billToGst"
                value={billToGst}
                onChange={(e) => setBillToGst(e.target.value)}
                placeholder="29AAAAA0000A1Z5"
                className={osInputClass()}
              />
            </Field>
            <Field label="PAN">
              <input
                name="billToPan"
                value={billToPan}
                onChange={(e) => setBillToPan(e.target.value)}
                placeholder="AAAAA0000A"
                className={osInputClass()}
              />
            </Field>
            <Field label="State & Code">
              <div className="flex gap-2">
                <input
                  name="billToState"
                  value={billToState}
                  onChange={(e) => setBillToState(e.target.value)}
                  placeholder="Karnataka"
                  className={osInputClass()}
                />
                <input
                  name="billToStateCode"
                  value={billToStateCode}
                  onChange={(e) => setBillToStateCode(e.target.value)}
                  placeholder="29"
                  className={`w-14 ${osInputClass()}`}
                />
              </div>
            </Field>
          </div>
        </div>

        {/* Ship To Details Box */}
        <div className="rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-surface,#18181b)] p-4 space-y-3.5 shadow-sm">
          <div className="flex items-center justify-between border-b border-[var(--dash-border)] pb-2">
            <p className="font-archivo text-xs uppercase tracking-[0.08em] text-[var(--dash-muted)] font-semibold">
              Ship To Details
            </p>
            <button
              type="button"
              onClick={copyBillToShip}
              className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              <Copy className="h-3 w-3" />
              <span>Same as Bill To</span>
            </button>
          </div>

          <Field label="Consignee / Ship To Name">
            <input
              name="shipToName"
              value={shipToName}
              onChange={(e) => setShipToName(e.target.value)}
              placeholder="Leave blank if same as Bill To"
              className={osInputClass()}
            />
          </Field>

          <Field label="Shipping Address">
            <textarea
              name="shipToAddress"
              value={shipToAddress}
              onChange={(e) => setShipToAddress(e.target.value)}
              placeholder="Leave blank if same as Bill To address"
              className={osTextareaClass()}
              rows={2}
            />
          </Field>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Ship To GSTIN">
              <input
                name="shipToGst"
                value={shipToGst}
                onChange={(e) => setShipToGst(e.target.value)}
                placeholder="29AAAAA0000A1Z5"
                className={osInputClass()}
              />
            </Field>
            <Field label="Ship To State & Code">
              <div className="flex gap-2">
                <input
                  name="shipToState"
                  value={shipToState}
                  onChange={(e) => setShipToState(e.target.value)}
                  placeholder="Karnataka"
                  className={osInputClass()}
                />
                <input
                  name="shipToStateCode"
                  value={shipToStateCode}
                  onChange={(e) => setShipToStateCode(e.target.value)}
                  placeholder="29"
                  className={`w-14 ${osInputClass()}`}
                />
              </div>
            </Field>
          </div>
        </div>

        {/* Line Items Builder */}
        <div className="rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-surface,#18181b)] p-4 space-y-3.5 shadow-sm">
          <div className="flex items-center justify-between border-b border-[var(--dash-border)] pb-2">
            <p className="font-archivo text-xs uppercase tracking-[0.08em] text-[var(--dash-muted)] font-semibold">
              Product & Service Lines ({lineItems.length})
            </p>
            <button
              type="button"
              onClick={addItem}
              className="inline-flex items-center gap-1 rounded-lg bg-[var(--dash-border)] px-2.5 py-1 text-xs font-semibold text-[var(--dash-accent,#3b82f6)] hover:brightness-110 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add line item</span>
            </button>
          </div>

          <div className="space-y-3">
            {lineItems.map((item, i) => {
              const rowGross = (item.quantity || 1) * (item.unitPrice || 0);
              const rowDisc = Math.round(
                (rowGross * (item.discountPercent || 0)) / 100
              );
              const rowTaxable = rowGross - rowDisc;

              return (
                <div
                  key={i}
                  className="rounded-xl border border-[var(--dash-border)] bg-[#121214] p-3 space-y-2.5 relative group"
                >
                  <div className="flex items-center justify-between text-xs text-[var(--dash-muted)]">
                    <span className="font-bold text-[var(--dash-text)]">
                      Line #{i + 1}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px]">
                        Taxable:{" "}
                        <strong className="text-emerald-400 font-mono">
                          {formatCurrencyINR(rowTaxable)}
                        </strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => removeItem(i)}
                        title="Remove line item"
                        className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-12">
                    <div className="sm:col-span-8">
                      <input
                        name="itemDescription"
                        placeholder="Item / Service description *"
                        value={item.description}
                        onChange={(e) =>
                          updateItem(i, { description: e.target.value })
                        }
                        className={osInputClass()}
                        required
                      />
                    </div>
                    <div className="sm:col-span-4">
                      <input
                        name="itemHsn"
                        placeholder="HSN/SAC (e.g. 998314)"
                        value={item.hsnSac}
                        onChange={(e) =>
                          updateItem(i, { hsnSac: e.target.value })
                        }
                        className={osInputClass()}
                      />
                    </div>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-12">
                    <div className="sm:col-span-3">
                      <div className="relative">
                        <input
                          name="itemQty"
                          type="number"
                          step="any"
                          min="0.01"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) =>
                            updateItem(i, {
                              quantity: Number(e.target.value) || 0,
                            })
                          }
                          className={osInputClass()}
                        />
                        <span className="absolute right-2 top-2 text-[10px] text-[var(--dash-muted)] uppercase">
                          Qty
                        </span>
                      </div>
                    </div>
                    <div className="sm:col-span-3">
                      <input
                        name="itemUom"
                        placeholder="UOM (Nos, Units, Hrs)"
                        value={item.uom}
                        onChange={(e) =>
                          updateItem(i, { uom: e.target.value })
                        }
                        className={osInputClass()}
                      />
                    </div>
                    <div className="sm:col-span-4">
                      <div className="relative">
                        <input
                          name="itemPrice"
                          type="number"
                          step="any"
                          min="0"
                          placeholder="Unit Rate (₹)"
                          value={item.unitPrice || ""}
                          onChange={(e) =>
                            updateItem(i, {
                              unitPrice: Number(e.target.value) || 0,
                            })
                          }
                          className={osInputClass()}
                        />
                        <span className="absolute right-2 top-2 text-[10px] text-[var(--dash-muted)]">
                          ₹ Rate
                        </span>
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <div className="relative">
                        <input
                          name="itemDisc"
                          type="number"
                          min="0"
                          max="100"
                          placeholder="Disc %"
                          value={item.discountPercent || ""}
                          onChange={(e) =>
                            updateItem(i, {
                              discountPercent: Number(e.target.value) || 0,
                            })
                          }
                          className={osInputClass()}
                        />
                        <span className="absolute right-2 top-2 text-[10px] text-[var(--dash-muted)]">
                          %
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <input
                      name="itemSpecs"
                      placeholder="Specifications / Sub-notes (optional)"
                      value={item.specifications}
                      onChange={(e) =>
                        updateItem(i, { specifications: e.target.value })
                      }
                      className={`text-xs ${osInputClass()}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Remarks & Notes */}
        <div className="rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-surface,#18181b)] p-4 space-y-3.5 shadow-sm">
          <Field label="Remarks / Scope of Work">
            <textarea
              name="remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Work commenced upon advance receipt..."
              className={osTextareaClass()}
              rows={2}
            />
          </Field>

          <Field label="Internal Document Notes">
            <textarea
              name="documentNote"
              value={documentNote}
              onChange={(e) => setDocumentNote(e.target.value)}
              placeholder="Optional private reference note"
              className={osTextareaClass()}
              rows={2}
            />
          </Field>
        </div>

        {initial?.requireReason ? (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
            <Field label="Audit Reason (Required if total changes)">
              <input
                name="reason"
                required
                placeholder="Explain why this invoice is being modified"
                className={osInputClass()}
              />
            </Field>
          </div>
        ) : null}

        {state.error ? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
            {state.error}
          </div>
        ) : null}
        {state.success ? (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-400">
            {state.success}
          </div>
        ) : null}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
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
                  initial?.invoiceNumber || "editco-invoice"
                );
              })
            }
          >
            {pdfPending ? "Preparing PDF…" : "Download High-Res PDF"}
          </Button>
          {extraActions}
        </div>
      </form>

      {/* Unscaled sheet for PDF capture (Hidden off-screen) */}
      <div
        className="pointer-events-none fixed left-[-10000px] top-0"
        aria-hidden
      >
        <InvoiceSheet data={preview} sheetRef={sheetRef} />
      </div>

      {/* Live Interactive Preview Column */}
      <div className="xl:sticky xl:top-6 xl:self-start space-y-3">
        <div className="flex items-center justify-between">
          <p className="font-archivo text-xs uppercase tracking-[0.08em] text-[var(--dash-muted)] font-semibold">
            Live GST Invoice Preview
          </p>
          <span className="text-[11px] text-[var(--dash-muted)]">
            A4 Standard Sheet · 794px
          </span>
        </div>

        <div className="overflow-auto rounded-[24px] border border-[var(--dash-border)] bg-[var(--dash-surface,#18181b)] p-2 sm:p-4 shadow-xl">
          <div className="mx-auto origin-top scale-[0.52] sm:scale-[0.62] lg:scale-[0.70] xl:scale-[0.74] transition-transform">
            <InvoiceSheet data={preview} />
          </div>
        </div>
      </div>
    </div>
  );
}
