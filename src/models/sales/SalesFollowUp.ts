import { Schema, models, model, type InferSchemaType, Types } from "mongoose";
import {
  SALES_FOLLOWUP_STATUSES,
  SALES_FOLLOWUP_TYPES,
  SALES_LEAD_PRIORITIES,
  type SalesFollowUpStatus,
  type SalesFollowUpType,
  type SalesLeadPriority,
} from "@/lib/sales/constants";

const salesFollowUpSchema = new Schema(
  {
    leadId: { type: Schema.Types.ObjectId, ref: "SalesLead" },
    dealId: { type: Schema.Types.ObjectId, ref: "SalesDeal" },
    customerId: { type: Schema.Types.ObjectId, ref: "SalesCustomer" },
    ownerEmployeeId: { type: Schema.Types.ObjectId, ref: "SalesEmployee", required: true, index: true },
    type: { type: String, enum: SALES_FOLLOWUP_TYPES, default: "call" },
    dueAt: { type: Date, required: true },
    notes: { type: String, default: "" },
    priority: { type: String, enum: SALES_LEAD_PRIORITIES, default: "medium" },
    status: { type: String, enum: SALES_FOLLOWUP_STATUSES, default: "pending", index: true },
    completedAt: { type: Date },
    createdBy: { type: String, default: "" },
  },
  { timestamps: true }
);

salesFollowUpSchema.index({ ownerEmployeeId: 1, dueAt: 1 });

export type SalesFollowUpDoc = InferSchemaType<typeof salesFollowUpSchema> & {
  _id: Types.ObjectId;
  status: SalesFollowUpStatus;
  type: SalesFollowUpType;
  priority: SalesLeadPriority;
  createdAt: Date;
  updatedAt: Date;
};

export const SalesFollowUp = models.SalesFollowUp || model("SalesFollowUp", salesFollowUpSchema);
