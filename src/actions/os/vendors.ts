"use server";

import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { requireStaff } from "@/lib/os/guard";
import { logActivity, notifyStaff } from "@/lib/os/activity";
import { createUniqueConversionIds } from "@/lib/os/conversion-id";
import { bool, num, optDate, str } from "@/lib/os/form";
import { findConversionDuplicates } from "@/lib/os/services/company-service";
import { Company } from "@/models/os/Company";
import { Contact } from "@/models/os/Contact";
import { Conversion } from "@/models/os/Conversion";
import { Vendor, VENDOR_ACTIVE_STATUSES, type VendorActiveStatus } from "@/models/os/Vendor";
import { Project } from "@/models/os/Project";
import type { ActionState } from "@/actions/auth";

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function resolveCompanyAndContact(input: {
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
  const contactOr: Record<string, unknown>[] = [];
  if (input.email) contactOr.push({ email: input.email });
  if (input.phone) contactOr.push({ phone: input.phone });

  let contactDoc: {
    _id: mongoose.Types.ObjectId;
    companyId?: mongoose.Types.ObjectId;
  } | null = null;
  let companyIdToUse: mongoose.Types.ObjectId | null = null;

  if (contactOr.length) {
    const existingContact = await Contact.findOne({
      recordStatus: "active",
      $or: contactOr,
    })
      .sort({ updatedAt: -1 })
      .lean();
    if (existingContact) {
      contactDoc = {
        _id: existingContact._id as mongoose.Types.ObjectId,
        companyId: existingContact.companyId as mongoose.Types.ObjectId | undefined,
      };
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
  } else {
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
  }

  if (!contactDoc) {
    const createdContact = await Contact.create({
      companyId: companyIdToUse,
      name: input.contactPerson.trim() || companyNameTrim,
      email: input.email || "",
      phone: input.phone || "",
      isPrimary: true,
      createdBy: input.staffEmail,
      updatedBy: input.staffEmail,
    });
    contactDoc = {
      _id: createdContact._id as mongoose.Types.ObjectId,
      companyId: companyIdToUse ?? undefined,
    };
  } else {
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

  if (!companyIdToUse || !contactDoc) {
    throw new Error("Failed to resolve company/contact");
  }

  return {
    companyId: companyIdToUse,
    contactId: contactDoc._id,
  };
}

export async function createClient(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const gate = await requireStaff("vendors:write");
  if (!gate.ok) return { error: gate.error };
  await connectDB();

  const companyName = str(formData, "companyName");
  if (!companyName) return { error: "Company name is required" };

  const contactPerson = str(formData, "contactPerson") || companyName;
  const email = str(formData, "email").toLowerCase();
  const phone = str(formData, "phone");
  const address = str(formData, "address");
  const location = str(formData, "location");
  const industry = str(formData, "industry");
  const gstNumber = str(formData, "gstNumber");
  const website = str(formData, "website");
  const owner = str(formData, "accountOwner") || gate.staff.name;
  const activeStatusRaw = str(formData, "activeStatus");
  const activeStatus: VendorActiveStatus = VENDOR_ACTIVE_STATUSES.includes(
    activeStatusRaw as VendorActiveStatus
  )
    ? (activeStatusRaw as VendorActiveStatus)
    : "active";
  const conversionValue = num(formData, "conversionValue");
  const services = formData.getAll("services").map(String).filter(Boolean);
  const expectedStart = optDate(formData, "expectedStart");
  const createFirstProject = bool(formData, "createProject");
  const projectName = str(formData, "projectName") || companyName;
  const forceNew = bool(formData, "forceNew");
  const notes = str(formData, "notes");

  if (!forceNew) {
    const duplicates = await findConversionDuplicates({
      companyName,
      email,
      phone,
    });
    const vendorDup = duplicates.find((d) => d.type === "vendor");
    if (vendorDup) {
      return {
        error: `A client already exists (${vendorDup.label}). Open Clients and reuse it, or check “Force new client”.`,
      };
    }
  }

  const ids = await createUniqueConversionIds();

  let publicCode = ids.publicCode;
  let vendorId = "";

  // Standalone local Mongo (Docker) does not support multi-doc transactions.
  try {
    const canonical = await resolveCompanyAndContact({
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

    const conversionDoc = await Conversion.create({
      conversionUuid: ids.conversionUuid,
      publicCode: ids.publicCode,
      conversionValue,
      services,
      expectedStart,
      owner,
      notes,
      origin: "direct_client",
      convertedAt: new Date(),
      createdBy: gate.staff.email,
      updatedBy: gate.staff.email,
    });

    const vendorDoc = await Vendor.create({
      conversionUuid: ids.conversionUuid,
      conversionId: conversionDoc._id,
      companyId: canonical.companyId,
      primaryContactId: canonical.contactId,
      companyName,
      contactPerson,
      email,
      phone,
      address,
      location,
      industry,
      gstNumber,
      website,
      accountOwner: owner,
      source: "direct",
      activeStatus,
      onboardedAt: new Date(),
      createdBy: gate.staff.email,
      updatedBy: gate.staff.email,
    });

    await Conversion.updateOne(
      { _id: conversionDoc._id },
      { $set: { vendorId: vendorDoc._id } }
    );

    if (createFirstProject) {
      await Project.create({
        conversionUuid: ids.conversionUuid,
        conversionId: conversionDoc._id,
        vendorId: vendorDoc._id,
        name: projectName,
        service: services[0] || "",
        description: notes,
        startDate: expectedStart,
        budget: conversionValue,
        status: "planned",
        createdBy: gate.staff.email,
        updatedBy: gate.staff.email,
      });
    }

    publicCode = ids.publicCode;
    vendorId = String(vendorDoc._id);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Could not create client. Please retry.";
    console.error("[createClient]", err);
    return { error: message || "Could not create client. Please retry." };
  }

  await logActivity({
    title: "Client created directly",
    detail: `${publicCode} · ${companyName}`,
    createdBy: gate.staff.email,
    conversionUuid: ids.conversionUuid,
    vendorId,
    entityType: "vendor",
    entityId: vendorId,
  });
  await logActivity({
    title: "Conversion UUID generated",
    detail: `${publicCode} (${ids.conversionUuid})`,
    createdBy: gate.staff.email,
    conversionUuid: ids.conversionUuid,
    entityType: "conversion",
  });
  if (createFirstProject) {
    await logActivity({
      title: "Project created",
      detail: projectName,
      createdBy: gate.staff.email,
      conversionUuid: ids.conversionUuid,
      vendorId,
      entityType: "project",
    });
  }

  await notifyStaff({
    type: "vendor",
    title: "New client onboarded",
    body: `${companyName} → ${publicCode}`,
    href: `/admin/os/c/${publicCode}`,
    conversionUuid: ids.conversionUuid,
  });

  revalidatePath("/admin/os", "layout");
  redirect(`/admin/os/c/${publicCode}`);
}

export async function updateVendor(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const gate = await requireStaff("vendors:write");
  if (!gate.ok) return { error: gate.error };
  await connectDB();
  const vendor = await Vendor.findById(str(formData, "id"));
  if (!vendor) return { error: "Vendor not found" };

  const companyName = str(formData, "companyName") || vendor.companyName;
  const contactPerson = str(formData, "contactPerson");
  const email = str(formData, "email").toLowerCase();
  const phone = str(formData, "phone");
  const address = str(formData, "address");
  const location = str(formData, "location");
  const industry = str(formData, "industry");
  const gstNumber = str(formData, "gstNumber");
  const website = str(formData, "website");
  const socialLinks = str(formData, "socialLinks");
  const accountOwner = str(formData, "accountOwner") || vendor.accountOwner;
  const conversionValue = num(formData, "conversionValue");
  const notes = str(formData, "notes");
  const expectedStart = optDate(formData, "expectedStart");
  const services = formData.getAll("services").map(String).filter(Boolean);

  vendor.companyName = companyName;
  vendor.contactPerson = contactPerson;
  vendor.email = email;
  vendor.phone = phone;
  vendor.address = address;
  vendor.location = location;
  vendor.industry = industry;
  vendor.gstNumber = gstNumber;
  vendor.website = website;
  vendor.socialLinks = socialLinks;
  vendor.accountOwner = accountOwner;
  const activeStatusRaw = str(formData, "activeStatus");
  if (VENDOR_ACTIVE_STATUSES.includes(activeStatusRaw as VendorActiveStatus)) {
    vendor.activeStatus = activeStatusRaw as VendorActiveStatus;
  }
  vendor.updatedBy = gate.staff.email;
  await vendor.save();

  try {
    const canonical = await resolveCompanyAndContact({
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
    vendor.companyId = canonical.companyId;
    vendor.primaryContactId = canonical.contactId;
    await vendor.save();
  } catch (err) {
    console.error("[updateVendor] company/contact sync", err);
  }

  const conversion = await Conversion.findOne({
    conversionUuid: vendor.conversionUuid,
  });
  if (conversion) {
    if (Number.isFinite(conversionValue) && conversionValue >= 0) {
      conversion.conversionValue = conversionValue;
    }
    if (services.length) conversion.services = services;
    conversion.notes = notes || conversion.notes;
    conversion.owner = accountOwner || conversion.owner;
    if (expectedStart) conversion.expectedStart = expectedStart;
    conversion.updatedBy = gate.staff.email;
    await conversion.save();

    // Keep primary project budget in sync with deal value so Total business updates.
    if (Number.isFinite(conversionValue) && conversionValue >= 0) {
      const primary = await Project.findOne({
        conversionUuid: vendor.conversionUuid,
        recordStatus: "active",
      }).sort({ createdAt: 1 });
      if (primary) {
        primary.budget = conversionValue;
        primary.updatedBy = gate.staff.email;
        await primary.save();
      }
    }
  }

  await logActivity({
    title: "Client updated",
    detail: vendor.companyName,
    createdBy: gate.staff.email,
    conversionUuid: vendor.conversionUuid,
    vendorId: vendor._id.toString(),
    entityType: "vendor",
    entityId: vendor._id.toString(),
  });

  revalidatePath("/admin/os", "layout");
  revalidatePath(`/admin/os/vendors/${vendor._id}`);
  revalidatePath("/admin/os/revenue");
  return { success: "Client saved" };
}

export async function deleteVendor(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const gate = await requireStaff("vendors:write");
  if (!gate.ok) return { error: gate.error };
  await connectDB();
  const vendor = await Vendor.findById(str(formData, "id"));
  if (!vendor) return { error: "Client not found" };

  vendor.recordStatus = "archived";
  vendor.updatedBy = gate.staff.email;
  await vendor.save();

  await logActivity({
    title: "Client deleted",
    detail: vendor.companyName,
    createdBy: gate.staff.email,
    conversionUuid: vendor.conversionUuid,
    vendorId: vendor._id.toString(),
    entityType: "vendor",
    entityId: vendor._id.toString(),
  });

  revalidatePath("/admin/os", "layout");
  revalidatePath("/admin/os/vendors");
  revalidatePath("/admin/os/clients");
  return { success: "Client deleted" };
}
