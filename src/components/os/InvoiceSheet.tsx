import type { Ref } from "react";
import { formatCurrencyINR, formatDate } from "@/lib/utils";
import { invoiceTotals, lineSubtotal } from "@/lib/os/money";

export type InvoiceLineItem = {
  description: string;
  quantity: number;
  unitPrice: number;
};

export type InvoiceSheetData = {
  invoiceNumber?: string;
  issueDate?: string | Date | null;
  dueDate?: string | Date | null;
  status?: string;
  billToName: string;
  billToAddress: string;
  billToEmail: string;
  billToPhone: string;
  billToGst: string;
  lineItems: InvoiceLineItem[];
  taxRate: number;
  discount: number;
  documentNote?: string;
  fromName?: string;
  fromAddress?: string;
  fromEmail?: string;
  fromGst?: string;
};

const DEFAULT_FROM = {
  fromName: "Editco Media",
  fromAddress: "India",
  fromEmail: "team@editcomedia.com",
  fromGst: "",
};

export function InvoiceSheet({
  data,
  className = "",
  sheetRef,
}: {
  data: InvoiceSheetData;
  className?: string;
  sheetRef?: Ref<HTMLDivElement>;
}) {
  const from = { ...DEFAULT_FROM, ...data };
  const items = data.lineItems.filter((i) => i.description.trim());
  const totals = invoiceTotals({
    lineItems: items,
    taxRate: data.taxRate,
    discount: data.discount,
  });
  const issue =
    data.issueDate && String(data.issueDate)
      ? formatDate(data.issueDate)
      : "—";
  const due =
    data.dueDate && String(data.dueDate) ? formatDate(data.dueDate) : "—";
  const statusLabel = data.status
    ? data.status.replace(/_/g, " ")
    : null;

  return (
    <div
      ref={sheetRef}
      className={`invoice-sheet relative overflow-hidden bg-white text-[#0a0a0a] shadow-[0_20px_60px_rgba(0,0,0,0.35)] ${className}`}
      style={{
        width: 794,
        minHeight: 1123,
        backgroundImage: "url(/os/invoice-bg.png)",
        backgroundSize: "100% 100%",
        backgroundPosition: "left top",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="relative z-10 flex min-h-[1123px] flex-col px-14 pb-14 pt-12 font-sans">
        {/* Top row: leave corner for bg logo; company on the right */}
        <header className="mb-8 flex items-start justify-between gap-8">
          {/* Matches the printed mark in the background (~56px at ~40px inset) */}
          <div className="h-14 w-14 shrink-0" aria-hidden />
          <div className="min-w-0 flex-1 text-right text-sm leading-relaxed text-[#333]">
            <p className="text-base font-semibold text-[#0a0a0a]">
              {from.fromName}
            </p>
            {from.fromAddress ? (
              <p className="mt-0.5 whitespace-pre-line text-[#555]">
                {from.fromAddress}
              </p>
            ) : null}
            {from.fromEmail ? <p className="text-[#555]">{from.fromEmail}</p> : null}
            {from.fromGst ? <p className="text-[#555]">GSTIN {from.fromGst}</p> : null}
          </div>
        </header>

        {/* Title + meta below the logo row so nothing overlaps the mark */}
        <div className="mb-10 flex items-end justify-between gap-8 border-b border-[#e8e8e8] pb-8">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#888]">
              Invoice
            </p>
            <h1 className="mt-2 text-[28px] font-bold leading-none tracking-tight text-[#0a0a0a]">
              {data.invoiceNumber || "Draft"}
            </h1>
            {statusLabel ? (
              <span className="mt-3 inline-block rounded-full border border-[#ddd] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#666]">
                {statusLabel}
              </span>
            ) : null}
          </div>
          <div className="shrink-0 text-right text-sm">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#888]">
              Dates
            </p>
            <p className="text-[#333]">
              <span className="text-[#999]">Issued</span>{" "}
              <span className="font-medium text-[#0a0a0a]">{issue}</span>
            </p>
            <p className="mt-1 text-[#333]">
              <span className="text-[#999]">Due</span>{" "}
              <span className="font-medium text-[#0a0a0a]">{due}</span>
            </p>
          </div>
        </div>

        <div className="mb-10 text-sm">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#888]">
            Bill to
          </p>
          <p className="text-base font-semibold text-[#0a0a0a]">
            {data.billToName || "Client name"}
          </p>
          {data.billToAddress ? (
            <p className="mt-1 max-w-sm whitespace-pre-line leading-relaxed text-[#444]">
              {data.billToAddress}
            </p>
          ) : (
            <p className="mt-1 text-[#bbb]">Address</p>
          )}
          <div className="mt-2 space-y-0.5 text-[#555]">
            {data.billToEmail ? <p>{data.billToEmail}</p> : null}
            {data.billToPhone ? <p>{data.billToPhone}</p> : null}
            {data.billToGst ? <p>GSTIN {data.billToGst}</p> : null}
          </div>
        </div>

        <div className="mb-6 flex-1">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-[#ddd] text-left text-[10px] uppercase tracking-[0.14em] text-[#888]">
                <th className="pb-3 pr-4 font-semibold">Description</th>
                <th className="w-16 pb-3 text-right font-semibold">Qty</th>
                <th className="w-28 pb-3 text-right font-semibold">Rate</th>
                <th className="w-28 pb-3 text-right font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-[#bbb]">
                    Line items will appear here
                  </td>
                </tr>
              ) : (
                items.map((item, i) => (
                  <tr key={i} className="border-b border-[#f0f0f0]">
                    <td className="py-3.5 pr-4 text-[#0a0a0a]">
                      {item.description}
                    </td>
                    <td className="py-3.5 text-right text-[#555]">
                      {item.quantity}
                    </td>
                    <td className="py-3.5 text-right text-[#555]">
                      {formatCurrencyINR(item.unitPrice)}
                    </td>
                    <td className="py-3.5 text-right font-medium text-[#0a0a0a]">
                      {formatCurrencyINR(
                        lineSubtotal(item.quantity, item.unitPrice)
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="ml-auto w-60 space-y-2.5 text-sm">
          <div className="flex justify-between text-[#555]">
            <span>Subtotal</span>
            <span>{formatCurrencyINR(totals.subtotal)}</span>
          </div>
          {totals.discount > 0 ? (
            <div className="flex justify-between text-[#555]">
              <span>Discount</span>
              <span>−{formatCurrencyINR(totals.discount)}</span>
            </div>
          ) : null}
          <div className="flex justify-between text-[#555]">
            <span>Tax ({Math.round((data.taxRate || 0) * 100)}%)</span>
            <span>{formatCurrencyINR(totals.taxAmount)}</span>
          </div>
          <div className="flex justify-between border-t border-[#ddd] pt-3 text-base font-bold text-[#0a0a0a]">
            <span>Total</span>
            <span>{formatCurrencyINR(totals.total)}</span>
          </div>
        </div>

        {data.documentNote ? (
          <div className="mt-10 border-t border-[#eee] pt-6 text-sm text-[#555]">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#888]">
              Notes
            </p>
            <p className="whitespace-pre-line leading-relaxed">
              {data.documentNote}
            </p>
          </div>
        ) : null}

        <footer className="mt-auto pt-14 text-center text-[10px] uppercase tracking-[0.18em] text-[#ccc]">
          Thank you for your business
        </footer>
      </div>
    </div>
  );
}
