import { Schema, models, model, type InferSchemaType, Types } from "mongoose";
import { RECORD_STATUSES } from "@/lib/os/constants";

export const VENDOR_ACTIVE_STATUSES = ["working_on_project", "active", "inactive"] as const;
export type VendorActiveStatus = (typeof VENDOR_ACTIVE_STATUSES)[number];

export const VENDOR_ACTIVE_STATUS_LABELS: Record<VendorActiveStatus, string> = {
  working_on_project: "Working on Project",
  active: "Active",
  inactive: "Inactive",
};

export const VENDOR_ACTIVE_STATUS_CLASSES: Record<VendorActiveStatus, string> = {
  working_on_project: "bg-amber-400/20 text-amber-300",
  active: "bg-emerald-400/20 text-emerald-300",
  inactive: "bg-rose-400/20 text-rose-300",
};

const vendorSchema = new Schema(
  {
    conversionUuid: { type: String, required: true, unique: true, index: true },
    conversionId: {
      type: Schema.Types.ObjectId,
      ref: "Conversion",
      required: true,
    },
    companyId: { type: Schema.Types.ObjectId, ref: "OsCompany", index: true },
    primaryContactId: { type: Schema.Types.ObjectId, ref: "OsContact" },
    companyName: { type: String, required: true, trim: true },
    contactPerson: { type: String, trim: true, default: "" },
    email: { type: String, lowercase: true, trim: true, default: "" },
    phone: { type: String, trim: true, default: "" },
    address: { type: String, default: "" },
    location: { type: String, trim: true, default: "" },
    industry: { type: String, default: "" },
    gstNumber: { type: String, default: "" },
    website: { type: String, default: "" },
    socialLinks: { type: String, default: "" },
    accountOwner: { type: String, default: "" },
    source: { type: String, default: "" },
    relationshipStatus: {
      type: String,
      enum: ["active", "inactive", "churned"],
      default: "active",
    },
    activeStatus: {
      type: String,
      enum: VENDOR_ACTIVE_STATUSES,
      default: "active",
    },
    onboardedAt: { type: Date, default: Date.now },
    recordStatus: {
      type: String,
      enum: RECORD_STATUSES,
      default: "active",
    },
    createdBy: { type: String, default: "" },
    updatedBy: { type: String, default: "" },
  },
  { timestamps: true }
);

vendorSchema.index({ companyName: 1 });
vendorSchema.index({ email: 1 });

export type VendorDoc = InferSchemaType<typeof vendorSchema> & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const Vendor = models.OsVendor || model("OsVendor", vendorSchema);
