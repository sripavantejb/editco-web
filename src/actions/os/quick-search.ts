"use server";

import { connectDB } from "@/lib/db";
import { getAdminSession } from "@/lib/session";
import { Conversion } from "@/models/os/Conversion";
import { Vendor } from "@/models/os/Vendor";
import { Invoice } from "@/models/os/Invoice";
import { isPublicCode } from "@/lib/os/conversion-id";

export type QuickSearchHit = {
  href: string;
  title: string;
  subtitle: string;
  kind: "conversion" | "client" | "invoice" | "page";
};

/** Fast OS lookup — lean + limited. Safe to call from the search popup. */
export async function quickOsSearch(query: string): Promise<QuickSearchHit[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const session = await getAdminSession();
  if (!session) return [];

  await connectDB();
  const hits: QuickSearchHit[] = [];
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(escaped, "i");

  if (isPublicCode(q)) {
    const found = await Conversion.findOne({
      publicCode: q.toUpperCase(),
      recordStatus: "active",
    })
      .select("publicCode owner")
      .lean();
    if (found) {
      hits.push({
        href: `/admin/os/c/${found.publicCode}`,
        title: found.publicCode,
        subtitle: found.owner || "Conversion",
        kind: "conversion",
      });
      return hits;
    }
  }

  const [conversions, vendors, invoices] = await Promise.all([
    Conversion.find({
      $or: [{ publicCode: re }, { owner: re }, { notes: re }],
      recordStatus: "active",
    })
      .select("publicCode owner")
      .limit(8)
      .lean(),
    Vendor.find({
      $or: [{ companyName: re }, { email: re }, { contactPerson: re }],
      recordStatus: "active",
    })
      .select("companyName email")
      .limit(8)
      .lean(),
    Invoice.find({
      $or: [{ invoiceNumber: re }, { billToName: re }, { billToEmail: re }],
      recordStatus: "active",
    })
      .select("invoiceNumber billToName")
      .limit(6)
      .lean(),
  ]);

  for (const c of conversions) {
    hits.push({
      href: `/admin/os/c/${c.publicCode}`,
      title: c.publicCode,
      subtitle: c.owner || "Conversion",
      kind: "conversion",
    });
  }
  for (const v of vendors) {
    hits.push({
      href: `/admin/os/vendors/${v._id}`,
      title: v.companyName,
      subtitle: v.email || "Client",
      kind: "client",
    });
  }
  for (const inv of invoices) {
    hits.push({
      href: `/admin/os/invoices/${inv._id}`,
      title: inv.invoiceNumber,
      subtitle: inv.billToName || "Invoice",
      kind: "invoice",
    });
  }

  return hits.slice(0, 16);
}
