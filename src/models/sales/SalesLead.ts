import { Schema, models, model, type InferSchemaType, Types } from "mongoose";
import {
  SALES_LEAD_PRIORITIES,
  SALES_LEAD_SOURCES,
  SALES_LEAD_STATUSES,
  SALES_LEAD_TEMPERATURES,
  SALES_RECORD_STATUSES,
  type SalesLeadPriority,
  type SalesLeadSource,
  type SalesLeadStatus,
  type SalesLeadTemperature,
} from "@/lib/sales/constants";

const salesLeadSchema = new Schema(
  {
    company: { type: String, trim: true, default: "" },
    contactPerson: { type: String, required: true, trim: true },
    phone: { type: String, trim: true, default: "" },
    email: { type: String, lowercase: true, trim: true, default: "" },
    website: { type: String, trim: true, default: "" },
    city: { type: String, trim: true, default: "" },
    state: { type: String, trim: true, default: "" },
    country: { type: String, trim: true, default: "" },
    source: { type: String, enum: SALES_LEAD_SOURCES, default: "website" },
    campaign: { type: String, trim: true, default: "" },
    industry: { type: String, trim: true, default: "" },
    requirement: { type: String, default: "" },
    priority: { type: String, enum: SALES_LEAD_PRIORITIES, default: "medium" },
    temperature: { type: String, enum: SALES_LEAD_TEMPERATURES, default: "warm" },
    status: { type: String, enum: SALES_LEAD_STATUSES, default: "new", index: true },
    assignedEmployeeId: { type: Schema.Types.ObjectId, ref: "SalesEmployee", index: true },
    assignedTeam: { type: String, trim: true, default: "" },
    territory: { type: String, trim: true, default: "" },
    lastContactedAt: { type: Date },
    nextFollowUpAt: { type: Date },
    notes: { type: String, default: "" },
    tags: { type: [String], default: [] },

    // Qualification (spec §6)
    qualificationNotes: { type: String, default: "" },
    budget: { type: Number, default: 0 },
    timeline: { type: String, trim: true, default: "" },
    decisionMaker: { type: String, trim: true, default: "" },
    businessNeed: { type: String, default: "" },
    probability: { type: Number, default: 0, min: 0, max: 100 },
    nextAction: { type: String, trim: true, default: "" },

    convertedCustomerId: { type: Schema.Types.ObjectId, ref: "SalesCustomer" },
    recordStatus: { type: String, enum: SALES_RECORD_STATUSES, default: "active", index: true },
    createdBy: { type: String, default: "" },
    updatedBy: { type: String, default: "" },
  },
  { timestamps: true }
);

salesLeadSchema.index({ email: 1 });
salesLeadSchema.index({ phone: 1 });
salesLeadSchema.index({ company: 1 });

export type SalesLeadDoc = InferSchemaType<typeof salesLeadSchema> & {
  _id: Types.ObjectId;
  status: SalesLeadStatus;
  priority: SalesLeadPriority;
  temperature: SalesLeadTemperature;
  source: SalesLeadSource;
  createdAt: Date;
  updatedAt: Date;
};

export const SalesLead = models.SalesLead || model("SalesLead", salesLeadSchema);
