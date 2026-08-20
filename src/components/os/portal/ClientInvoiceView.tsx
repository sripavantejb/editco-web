"use client";

import { useRef, useTransition } from "react";
import {
  InvoiceSheet,
  type InvoiceSheetData,
} from "@/components/os/InvoiceSheet";
import { downloadInvoicePdf } from "@/lib/os/invoice-pdf";
import { Button } from "@/components/referral/ui/button";

export function ClientInvoiceView({
  data,
  filename,
}: {
  data: InvoiceSheetData;
  filename: string;
}) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [pending, start] = useTransition();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={() =>
            start(async () => {
              if (!sheetRef.current) return;
              await downloadInvoicePdf(sheetRef.current, filename);
            })
          }
        >
          {pending ? "Preparing…" : "Download PDF"}
        </Button>
      </div>
      <div
        className="pointer-events-none fixed left-[-10000px] top-0"
        aria-hidden
      >
        <InvoiceSheet data={data} sheetRef={sheetRef} />
      </div>
      <div className="overflow-auto rounded-[24px] border border-[var(--dash-border)] bg-[var(--dash-surface)] p-3 sm:p-6">
        <div className="mx-auto w-fit origin-top scale-[0.55] sm:scale-[0.7] lg:scale-[0.85]">
          <InvoiceSheet data={data} />
        </div>
      </div>
    </div>
  );
}
