import { Schema, models, model, type InferSchemaType, Types } from "mongoose";
import {
  LEAD_PRIORITIES,
  LEAD_SOURCES,
  LEAD_STATUSES,
  RECORD_STATUSES,
  type LeadPriority,
  type LeadSource,
  type LeadStatus,
} from "@/lib/os/constants";

const leadSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    company: { type: String, trim: true, default: "" },
    companyId: { type: Schema.Types.ObjectId, ref: "OsCompany", index: true },
    primaryContactId: { type: Schema.Types.ObjectId, ref: "OsContact" },
    phone: { type: String, trim: true, default: "" },
    email: { type: String, lowercase: true, trim: true, default: "" },
    source: { type: String, enum: LEAD_SOURCES, default: "inbound" },
    industry: { type: String, trim: true, default: "", index: true },
    industrySlug: { type: String, trim: true, default: "", index: true },
    sector: { type: String, trim: true, default: "", index: true },
    interestedServices: { type: [String], default: [] },
    requirement: { type: String, default: "" },
    estimatedValue: { type: Number, default: 0 },
    assignedOwner: { type: String, trim: true, default: "" },
    assignedOwnerId: { type: Schema.Types.ObjectId, ref: "StaffUser" },
    status: { type: String, enum: LEAD_STATUSES, default: "new", index: true },
    priority: { type: String, enum: LEAD_PRIORITIES, default: "medium" },
    notes: { type: String, default: "" },
    referralId: { type: Schema.Types.ObjectId, ref: "Referral" },
    conversionId: { type: Schema.Types.ObjectId, ref: "Conversion" },
    conversionUuid: { type: String, index: true },
    recordStatus: {
      type: String,
      enum: RECORD_STATUSES,
      default: "active",
      index: true,
    },
    createdBy: { type: String, default: "" },
    updatedBy: { type: String, default: "" },
  },
  { timestamps: true }
);

leadSchema.index({ email: 1 });
leadSchema.index({ phone: 1 });
leadSchema.index({ company: 1 });

export type LeadDoc = InferSchemaType<typeof leadSchema> & {
  _id: Types.ObjectId;
  status: LeadStatus;
  priority: LeadPriority;
  source: LeadSource;
  createdAt: Date;
  updatedAt: Date;
};

export const Lead = models.OsLead || model("OsLead", leadSchema);
