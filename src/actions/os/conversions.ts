"use server";

import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { requireStaff } from "@/lib/os/guard";
import { logActivity, notifyStaff } from "@/lib/os/activity";
import { createUniqueConversionIds } from "@/lib/os/conversion-id";
import { bool, num, optDate, str } from "@/lib/os/form";
import { Lead } from "@/models/os/Lead";
import { LeadActivity } from "@/models/os/LeadActivity";
import { Conversion } from "@/models/os/Conversion";
import { Referral } from "@/models/Referral";
import { Company } from "@/models/os/Company";
import { Contact } from "@/models/os/Contact";
import { Vendor } from "@/models/os/Vendor";
import { Project } from "@/models/os/Project";
import { updateReferralStage } from "@/actions/admin";
import type { ActionState } from "@/actions/auth";

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function inferReferralProjectType(services: string[]) {
  if (services.includes("ai_agent")) return "ai_growth";
  if (services.includes("crm") || services.includes("automation")) {
    return "website_crm";
  }
  return "website";
}

export type LeadConversionDuplicatePreview = {
  companies: Array<{
    companyId: string;
    name: string;
  }>;
  contacts: Array<{
    contactId: string;
    companyId: string;
    companyName: string;
    email: string;
    phone: string;
    name: string;
  }>;
  vendors: Array<{
    vendorId: string;
    conversionId: string;
    conversionUuid: string;
    publicCode: string;
    companyName: string;
    email: string;
    phone: string;
    companyId?: string;
    primaryContactId?: string;
  }>;
  suggestedMode: "use_existing" | "create_new";
};

async function resolveCompanyAndPrimaryContact(input: {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  industry: string;
  website: string;
  address: string;
  gstNumber: string;
  staffEmail: string;
}) {
  const companyNameTrim = input.companyName.trim();

  // If we already have an active contact by email/phone, reuse it and its canonical company.
  const contactOr: Record<string, unknown>[] = [];
  if (input.email) contactOr.push({ email: input.email });
  if (input.phone) contactOr.push({ phone: input.phone });

  let contactDoc: any | null = null;
  let companyIdToUse: mongoose.Types.ObjectId | null = null;

  if (contactOr.length) {
    const existingContact = await Contact.findOne({
      recordStatus: "active",
      $or: contactOr,
    })
      .sort({ updatedAt: -1 })
      .lean();

    if (existingContact) {
      contactDoc = existingContact;
      companyIdToUse = existingContact.companyId as mongoose.Types.ObjectId;
    }
  }

  if (!companyIdToUse) {
    const existingCompany = await Company.findOne({
      recordStatus: "active",
      name: new RegExp(`^${escapeRegex(companyNameTrim)}$`, "i"),
    }).lean();

    if (existingCompany) {
      companyIdToUse = existingCompany._id as mongoose.Types.ObjectId;
    } else {
      const created = await Company.create({
        name: companyNameTrim,
        industry: input.industry || "",
        website: input.website || "",
        address: input.address || "",
        gstNumber: input.gstNumber || "",
        phone: input.phone || "",
        email: input.email || "",
        createdBy: input.staffEmail,
        updatedBy: input.staffEmail,
      });
      companyIdToUse = created._id;
    }
  }

  await Company.updateOne(
    { _id: companyIdToUse },
    {
      $set: {
        industry: input.industry || "",
        website: input.website || "",
        address: input.address || "",
        gstNumber: input.gstNumber || "",
        phone: input.phone || "",
        email: input.email || "",
        updatedBy: input.staffEmail,
      },
    }
  );

  // If we didn't find a contact, create one.
  if (!contactDoc) {
    contactDoc = await Contact.create({
      companyId: companyIdToUse,
      name: input.contactPerson.trim() || companyNameTrim,
      email: input.email || "",
      phone: input.phone || "",
      isPrimary: true,
      createdBy: input.staffEmail,
      updatedBy: input.staffEmail,
    });
  } else {
    // Keep the canonical contact but refresh key fields from wizard.
    await Contact.updateOne(
      { _id: contactDoc._id },
      {
        $set: {
          name: input.contactPerson.trim() || companyNameTrim,
          email: input.email || "",
          phone: input.phone || "",
          isPrimary: true,
          updatedBy: input.staffEmail,
        },
      }
    );
  }

  return {
    companyId: companyIdToUse,
    contactId: contactDoc._id as mongoose.Types.ObjectId,
  };
}

export async function previewLeadConversionDuplicates(input: {
  companyName: string;
  email: string;
  phone: string;
}) {
  const gate = await requireStaff("conversions:write");
  if (!gate.ok) return { error: gate.error };
  await connectDB();

  const companyName = input.companyName?.trim() || "";
  const email = (input.email || "").toLowerCase().trim();
  const phone = (input.phone || "").trim();

  const companyQuery: Record<string, unknown> = { recordStatus: "active" };
  if (companyName) {
    (companyQuery as any).name = new RegExp(`^${escapeRegex(companyName)}$`, "i");
  }

  const [companies, contacts, vendorsRaw] = await Promise.all([
    companyName
      ? Company.find(companyQuery)
          .sort({ updatedAt: -1 })
          .limit(5)
          .lean()
      : Promise.resolve([]),
    (() => {
      const or: Record<string, unknown>[] = [];
      if (email) or.push({ email });
      if (phone) or.push({ phone });
      if (!or.length) return Promise.resolve([]);
      return Contact.find({ recordStatus: "active", $or: or })
        .sort({ updatedAt: -1 })
        .limit(5)
        .lean();
    })(),
    (() => {
      const or: Record<string, unknown>[] = [];
      if (email) or.push({ email });
      if (phone) or.push({ phone });
      if (companyName) {
        or.push({
          companyName: new RegExp(`^${escapeRegex(companyName)}$`, "i"),
        });
      }
      if (!or.length) return Promise.resolve([]);
      return Vendor.find({ recordStatus: "active", $or: or })
        .sort({ updatedAt: -1 })
        .limit(5)
        .lean();
    })(),
  ]);

  const companyById = new Map(
    companies.map((c: any) => [String(c._id), c] as const)
  );

  // Contacts need company names; fetch missing ones from DB.
  const missingCompanyIds = Array.from(
    new Set(
      (contacts as any[]).map((c) => String(c.companyId)).filter((id) => !companyById.has(id))
    )
  );
  if (missingCompanyIds.length) {
    const moreCompanies = await Company.find({
      recordStatus: "active",
      _id: { $in: missingCompanyIds },
    }).lean();
    moreCompanies.forEach((c: any) => companyById.set(String(c._id), c));
  }

  const conversionsById = new Map<
    string,
    { publicCode: string; conversionUuid: string }
  >();
  const vendorConversionIds = vendorsRaw.map((v: any) => v.conversionId).filter(Boolean);
  if (vendorConversionIds.length) {
    const conversions = await Conversion.find({
      recordStatus: "active",
      _id: { $in: vendorConversionIds },
    })
      .select({ publicCode: 1, conversionUuid: 1 })
      .lean();
    conversions.forEach((c: any) =>
      conversionsById.set(String(c._id), {
        publicCode: c.publicCode,
        conversionUuid: c.conversionUuid,
      })
    );
  }

  const contactsOut = (contacts as any[]).map((c) => {
    const company = companyById.get(String(c.companyId)) as any | undefined;
    return {
      contactId: String(c._id),
      companyId: String(c.companyId),
      companyName: company?.name || "",
      email: c.email || "",
      phone: c.phone || "",
      name: c.name || "",
    };
  });

  const vendorsOut = (vendorsRaw as any[]).map((v) => {
    const conv = conversionsById.get(String(v.conversionId));
    return {
      vendorId: String(v._id),
      conversionId: String(v.conversionId),
      conversionUuid: conv?.conversionUuid || String(v.conversionUuid || ""),
      publicCode: conv?.publicCode || "",
      companyName: v.companyName,
      email: v.email || "",
      phone: v.phone || "",
      companyId: v.companyId ? String(v.companyId) : undefined,
      primaryContactId: v.primaryContactId ? String(v.primaryContactId) : undefined,
    };
  });

  const suggestedMode: LeadConversionDuplicatePreview["suggestedMode"] =
    vendorsOut.length > 0 ? "use_existing" : "create_new";

  return {
    companies: (companies as any[]).map((c) => ({
      companyId: String(c._id),
      name: c.name,
    })),
    contacts: contactsOut,
    vendors: vendorsOut,
    suggestedMode,
  } as LeadConversionDuplicatePreview;
}

export async function convertLead(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const gate = await requireStaff("conversions:write");
  if (!gate.ok) return { error: gate.error };
  await connectDB();

  const leadId = str(formData, "leadId");
  const lead = await Lead.findById(leadId);
  if (!lead || lead.recordStatus !== "active") return { error: "Lead not found" };
  if (lead.status === "converted" || lead.conversionId) {
    return { error: "This lead is already converted" };
  }

  const prevLeadStatus = lead.status;

  const companyName =
    str(formData, "companyName") || lead.company || lead.name;
  const contactPerson = str(formData, "contactPerson") || lead.name;
  const conversionValue =
    num(formData, "conversionValue") || lead.estimatedValue;
  const services = formData.getAll("services").map(String).filter(Boolean);
  const expectedStart = optDate(formData, "expectedStart");
  const owner = str(formData, "owner") || gate.staff.name;
  const createFirstProject = bool(formData, "createProject");
  const projectName = str(formData, "projectName") || companyName;
  const forceNew = bool(formData, "forceNew");
  const selectedVendorId = str(formData, "selectedVendorId");

  const email = (str(formData, "email") || lead.email || "")
    .toLowerCase()
    .trim();
  const phone = (str(formData, "phone") || lead.phone || "").trim();
  const address = str(formData, "address");
  const industry = str(formData, "industry") || lead.industry;
  const gstNumber = str(formData, "gstNumber");
  const website = str(formData, "website");

  // Duplicate protection: reuse an existing active conversion relationship if a matching vendor exists.
  let existingVendor: {
    _id: mongoose.Types.ObjectId;
    conversionId: mongoose.Types.ObjectId;
    conversionUuid: string;
    companyId?: mongoose.Types.ObjectId;
    primaryContactId?: mongoose.Types.ObjectId;
  } | null = null;

  if (!forceNew) {
    if (selectedVendorId) {
      const selected = await Vendor.findById(selectedVendorId)
        .select({
          conversionId: 1,
          conversionUuid: 1,
          companyId: 1,
          primaryContactId: 1,
          recordStatus: 1,
        })
        .lean();

      if (selected && selected.recordStatus === "active") {
        existingVendor = {
          _id: selected._id,
          conversionId: selected.conversionId,
          conversionUuid: selected.conversionUuid,
          companyId: selected.companyId,
          primaryContactId: selected.primaryContactId,
        };
      }
    }

    const or: Record<string, unknown>[] = [];
    if (!existingVendor) {
      if (email) or.push({ email });
      if (phone) or.push({ phone });
      if (companyName?.trim()) {
        or.push({
          companyName: new RegExp(`^${escapeRegex(companyName.trim())}$`, "i"),
        });
      }

      if (or.length) {
        existingVendor = await Vendor.findOne({
          recordStatus: "active",
          $or: or,
        })
          .select({
            conversionId: 1,
            conversionUuid: 1,
            companyId: 1,
            primaryContactId: 1,
          })
          .lean();
      }
    }
  }

  let existingConversion: {
    _id: mongoose.Types.ObjectId;
    conversionUuid: string;
    publicCode: string;
    conversionValue: number;
    services: string[];
  } | null = null;

  if (existingVendor && !forceNew) {
    existingConversion = await Conversion.findOne({
      _id: existingVendor.conversionId,
      recordStatus: "active",
    })
      .select({ conversionUuid: 1, publicCode: 1, conversionValue: 1, services: 1 })
      .lean();
  }

  const useExisting = Boolean(existingVendor && existingConversion && !forceNew);

  let conversionIdToUse: mongoose.Types.ObjectId;
  let conversionUuidToUse: string;
  let publicCodeToUse: string;
  let vendorIdToUse: mongoose.Types.ObjectId;
  let createdNew = false;

  try {
    if (useExisting && existingVendor && existingConversion) {
      conversionIdToUse = existingConversion._id;
      conversionUuidToUse = existingConversion.conversionUuid;
      publicCodeToUse = existingConversion.publicCode;
      vendorIdToUse = existingVendor._id;

      const shouldResolveCanonical =
        !existingVendor.companyId || !existingVendor.primaryContactId;

      const canonical = shouldResolveCanonical
        ? await resolveCompanyAndPrimaryContact({
            companyName,
            contactPerson,
            email,
            phone,
            industry,
            website,
            address,
            gstNumber,
            staffEmail: gate.staff.email,
          })
        : null;

      const companyIdToUse =
        existingVendor.companyId ?? canonical?.companyId ?? null;
      const contactIdToUse =
        existingVendor.primaryContactId ?? canonical?.contactId ?? null;

      await Vendor.updateOne(
        { _id: vendorIdToUse },
        {
          $set: {
            companyName,
            contactPerson,
            email,
            phone,
            address,
            industry,
            gstNumber,
            website,
            accountOwner: owner,
            source: lead.source,
            companyId: companyIdToUse,
            primaryContactId: contactIdToUse,
            updatedBy: gate.staff.email,
          },
        }
      );

      lead.status = "converted";
      lead.conversionId = conversionIdToUse;
      lead.conversionUuid = conversionUuidToUse;
      lead.company = companyName;
      lead.companyId = companyIdToUse;
      lead.primaryContactId = contactIdToUse;
      lead.updatedBy = gate.staff.email;
      await lead.save();

      if (createFirstProject) {
        await Project.create({
          conversionUuid: conversionUuidToUse,
          conversionId: conversionIdToUse,
          vendorId: vendorIdToUse,
          name: projectName,
          service: services[0] || "",
          description: lead.requirement,
          startDate: expectedStart,
          budget: conversionValue,
          status: "planned",
          createdBy: gate.staff.email,
          updatedBy: gate.staff.email,
        });
      }
    } else {
      createdNew = true;
      const ids = await createUniqueConversionIds();

      const conversionDoc = await Conversion.create({
        conversionUuid: ids.conversionUuid,
        publicCode: ids.publicCode,
        leadId: lead._id,
        referralId: lead.referralId,
        conversionValue,
        services,
        expectedStart,
        owner,
        convertedAt: new Date(),
        origin: "lead_convert",
        createdBy: gate.staff.email,
        updatedBy: gate.staff.email,
      });

      const canonical = await resolveCompanyAndPrimaryContact({
        companyName,
        contactPerson,
        email,
        phone,
        industry,
        website,
        address,
        gstNumber,
        staffEmail: gate.staff.email,
      });

      const vendorDoc = await Vendor.create({
        conversionUuid: ids.conversionUuid,
        conversionId: conversionDoc._id,
        companyName,
        companyId: canonical.companyId,
        primaryContactId: canonical.contactId,
        contactPerson,
        email,
        phone,
        address,
        industry,
        gstNumber,
        website,
        accountOwner: owner,
        source: lead.source,
        onboardedAt: new Date(),
        createdBy: gate.staff.email,
        updatedBy: gate.staff.email,
      });

      await Conversion.updateOne(
        { _id: conversionDoc._id },
        { $set: { vendorId: vendorDoc._id } }
      );

      conversionIdToUse = conversionDoc._id;
      conversionUuidToUse = ids.conversionUuid;
      publicCodeToUse = ids.publicCode;
      vendorIdToUse = vendorDoc._id;

      lead.status = "converted";
      lead.conversionId = conversionIdToUse;
      lead.conversionUuid = conversionUuidToUse;
      lead.company = companyName;
      lead.companyId = canonical.companyId;
      lead.primaryContactId = canonical.contactId;
      lead.updatedBy = gate.staff.email;
      await lead.save();

      if (createFirstProject) {
        await Project.create({
          conversionUuid: conversionUuidToUse,
          conversionId: conversionIdToUse,
          vendorId: vendorIdToUse,
          name: projectName,
          service: services[0] || "",
          description: lead.requirement,
          startDate: expectedStart,
          budget: conversionValue,
          status: "planned",
          createdBy: gate.staff.email,
          updatedBy: gate.staff.email,
        });
      }
    }
  } catch (err) {
    console.error("[convertLead]", err);
    const raw =
      err instanceof Error ? err.message : "Conversion failed. Please retry.";
    // Local Docker Mongo is standalone (no replica set) — surface a clear message.
    if (/retryable writes|transaction numbers|Transactions are not supported/i.test(raw)) {
      return {
        error:
          "Database does not support transactions. Restart the app so it reconnects with retryWrites=false, then retry.",
      };
    }
    return { error: raw || "Conversion failed. Please retry." };
  }

  await LeadActivity.create({
    leadId: lead._id,
    eventType: "converted",
    fromStatus: prevLeadStatus,
    toStatus: "converted",
    reason: `Conversion ${publicCodeToUse}`,
    expectedValue: conversionValue,
    createdBy: gate.staff.email,
  });

  await logActivity({
    title: createdNew ? "Lead converted" : "Lead linked to existing conversion",
    detail: `${publicCodeToUse} · ${companyName}`,
    createdBy: gate.staff.email,
    conversionUuid: conversionUuidToUse,
    leadId: lead._id.toString(),
    vendorId: vendorIdToUse.toString(),
    entityType: "conversion",
    entityId: conversionIdToUse.toString(),
  });

  if (createdNew) {
    await logActivity({
      title: "Conversion UUID generated",
      detail: `${publicCodeToUse} (${conversionUuidToUse})`,
      createdBy: gate.staff.email,
      conversionUuid: conversionUuidToUse,
      entityType: "conversion",
      entityId: conversionIdToUse.toString(),
    });
    await logActivity({
      title: "Client relationship created",
      detail: companyName,
      createdBy: gate.staff.email,
      conversionUuid: conversionUuidToUse,
      vendorId: vendorIdToUse.toString(),
      entityType: "vendor",
      entityId: vendorIdToUse.toString(),
    });
    if (createFirstProject) {
      await logActivity({
        title: "Project created",
        detail: projectName,
        createdBy: gate.staff.email,
        conversionUuid: conversionUuidToUse,
        vendorId: vendorIdToUse.toString(),
        entityType: "project",
      });
    }
  }

  await notifyStaff({
    type: "conversion",
    title: "Conversion completed",
    body: `${companyName} → ${publicCodeToUse}`,
    href: `/admin/os/c/${publicCodeToUse}`,
    conversionUuid: conversionUuidToUse,
  });

  // Referral sync: promote referral to won + calculate reward if conversion originated from Refer & Earn.
  if (lead.referralId) {
    const referral = await Referral.findById(lead.referralId).lean();
    if (referral && referral.stage !== "won") {
      const servicesForReferral = createdNew
        ? services
        : existingConversion?.services ?? services;
      const conversionValueForReferral = createdNew
        ? conversionValue
        : existingConversion?.conversionValue ?? conversionValue;

      const projectType = inferReferralProjectType(servicesForReferral);
      const fd = new FormData();
      fd.set("referralId", String(referral._id));
      fd.set("stage", "won");
      fd.set("projectType", projectType);
      fd.set("projectValue", String(conversionValueForReferral));
      await updateReferralStage({}, fd);
    }
  }

  revalidatePath("/admin/os", "layout");
  revalidatePath(`/admin/os/c/${publicCodeToUse}`, "layout");
  redirect(`/admin/os/c/${publicCodeToUse}`);
}
