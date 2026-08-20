import { Schema, models, model, type InferSchemaType, Types } from "mongoose";
import { RECORD_STATUSES } from "@/lib/os/constants";

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
