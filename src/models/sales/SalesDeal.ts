import { Schema, models, model, type InferSchemaType, Types } from "mongoose";
import {
  SALES_DEAL_STAGES,
  SALES_LEAD_PRIORITIES,
  SALES_LOST_REASONS,
  SALES_RECORD_STATUSES,
  type SalesDealStage,
  type SalesLeadPriority,
  type SalesLostReason,
} from "@/lib/sales/constants";

const salesDealSchema = new Schema(
  {
    dealName: { type: String, required: true, trim: true },
    leadId: { type: Schema.Types.ObjectId, ref: "SalesLead" },
    customerId: { type: Schema.Types.ObjectId, ref: "SalesCustomer" },
    value: { type: Number, default: 0 },
    probability: { type: Number, default: 10, min: 0, max: 100 },
    stage: { type: String, enum: SALES_DEAL_STAGES, default: "new", index: true },
    ownerEmployeeId: { type: Schema.Types.ObjectId, ref: "SalesEmployee", index: true },
    priority: { type: String, enum: SALES_LEAD_PRIORITIES, default: "medium" },
    source: { type: String, trim: true, default: "" },
    expectedCloseDate: { type: Date },
    lastActivityAt: { type: Date },
    nextFollowUpAt: { type: Date },
    notes: { type: String, default: "" },

    // Negotiation (spec §17)
    currentOffer: { type: Number, default: 0 },
    finalOffer: { type: Number, default: 0 },
    discountRequested: { type: Number, default: 0 },
    discountApproved: { type: Number, default: 0 },
    competitor: { type: String, trim: true, default: "" },

    // Closure (spec §18)
    closedAt: { type: Date },
    paymentStatus: { type: String, trim: true, default: "" },
    lostReason: { type: String, enum: [...SALES_LOST_REASONS, ""], default: "" },
    lostNotes: { type: String, default: "" },

    recordStatus: { type: String, enum: SALES_RECORD_STATUSES, default: "active", index: true },
    createdBy: { type: String, default: "" },
    updatedBy: { type: String, default: "" },
  },
  { timestamps: true }
);

export type SalesDealDoc = InferSchemaType<typeof salesDealSchema> & {
  _id: Types.ObjectId;
  stage: SalesDealStage;
  priority: SalesLeadPriority;
  lostReason: SalesLostReason | "";
  createdAt: Date;
  updatedAt: Date;
};

export const SalesDeal = models.SalesDeal || model("SalesDeal", salesDealSchema);
