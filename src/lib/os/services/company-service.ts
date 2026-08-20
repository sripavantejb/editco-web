import { connectDB } from "@/lib/db";
import { Company } from "@/models/os/Company";
import { Contact } from "@/models/os/Contact";
import { Vendor } from "@/models/os/Vendor";
import { Conversion } from "@/models/os/Conversion";

export type DuplicateCheckInput = {
  companyName?: string;
  email?: string;
  phone?: string;
};

export type DuplicateMatch = {
  type: "company" | "contact" | "vendor" | "conversion";
  id: string;
  label: string;
};

/** Find potential duplicates before conversion (Phase 3 wizard will surface these). */
export async function findConversionDuplicates(
  input: DuplicateCheckInput
): Promise<DuplicateMatch[]> {
  await connectDB();
  const matches: DuplicateMatch[] = [];
  const name = input.companyName?.trim();
  const email = input.email?.trim().toLowerCase();
  const phone = input.phone?.trim();

  if (name) {
    const companies = await Company.find({
      recordStatus: "active",
      name: { $regex: new RegExp(`^${escapeRegex(name)}$`, "i") },
    })
      .limit(5)
      .lean();
    for (const c of companies) {
      matches.push({
        type: "company",
        id: String(c._id),
        label: c.name,
      });
    }

    const vendors = await Vendor.find({
      recordStatus: "active",
      companyName: { $regex: new RegExp(`^${escapeRegex(name)}$`, "i") },
    })
      .limit(5)
      .lean();
    for (const v of vendors) {
      matches.push({
        type: "vendor",
        id: String(v._id),
        label: v.companyName,
      });
    }
  }

  if (email) {
    const contacts = await Contact.find({
      recordStatus: "active",
      email,
    })
      .limit(5)
      .lean();
    for (const c of contacts) {
      matches.push({
        type: "contact",
        id: String(c._id),
        label: `${c.name} (${c.email})`,
      });
    }

    const vendorsByEmail = await Vendor.find({
      recordStatus: "active",
      email,
    })
      .limit(5)
      .lean();
    for (const v of vendorsByEmail) {
      if (!matches.some((m) => m.type === "vendor" && m.id === String(v._id))) {
        matches.push({
          type: "vendor",
          id: String(v._id),
          label: `${v.companyName} (${v.email})`,
        });
      }
    }
  }

  if (phone) {
    const contacts = await Contact.find({
      recordStatus: "active",
      phone,
    })
      .limit(3)
      .lean();
    for (const c of contacts) {
      if (!matches.some((m) => m.type === "contact" && m.id === String(c._id))) {
        matches.push({
          type: "contact",
          id: String(c._id),
          label: `${c.name} (${c.phone})`,
        });
      }
    }
  }

  if (name || email) {
    const activeConversions = await Conversion.find({ recordStatus: "active" })
      .limit(100)
      .lean();
    if (activeConversions.length > 0) {
      const vendorIds = activeConversions
        .map((c) => c.vendorId)
        .filter(Boolean);
      if (vendorIds.length) {
        const linkedVendors = await Vendor.find({
          _id: { $in: vendorIds },
          recordStatus: "active",
          ...(name
            ? { companyName: { $regex: new RegExp(`^${escapeRegex(name)}$`, "i") } }
            : {}),
          ...(email ? { email } : {}),
        }).lean();
        for (const v of linkedVendors) {
          const conv = activeConversions.find(
            (c) => String(c.vendorId) === String(v._id)
          );
          if (conv && !matches.some((m) => m.type === "conversion")) {
            matches.push({
              type: "conversion",
              id: conv.publicCode,
              label: `${conv.publicCode} · ${v.companyName}`,
            });
          }
        }
      }
    }
  }

  return matches;
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
