import { LEAD_CSV_TEMPLATE } from "@/lib/os/lead-csv";
import { requireStaff } from "@/lib/os/guard";

export const dynamic = "force-dynamic";

export async function GET() {
  const gate = await requireStaff("leads:write");
  if (!gate.ok) {
    return new Response(gate.error || "Unauthorized", { status: 401 });
  }

  return new Response(LEAD_CSV_TEMPLATE, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="leads-import-template.csv"',
      "Cache-Control": "no-store",
    },
  });
}
