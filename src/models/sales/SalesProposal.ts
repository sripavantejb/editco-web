import { Schema, models, model, type InferSchemaType, Types } from "mongoose";
import { SALES_PROPOSAL_STATUSES, type SalesProposalStatus } from "@/lib/sales/constants";

const salesProposalSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    customerId: { type: Schema.Types.ObjectId, ref: "SalesCustomer" },
    leadId: { type: Schema.Types.ObjectId, ref: "SalesLead" },
    dealId: { type: Schema.Types.ObjectId, ref: "SalesDeal" },
    ownerEmployeeId: { type: Schema.Types.ObjectId, ref: "SalesEmployee", required: true, index: true },
    scope: { type: String, default: "" },
    pricing: { type: Number, default: 0 },
    timeline: { type: String, trim: true, default: "" },
    terms: { type: String, default: "" },
    status: { type: String, enum: SALES_PROPOSAL_STATUSES, default: "draft", index: true },
    followUpAt: { type: Date },
    createdBy: { type: String, default: "" },
    updatedBy: { type: String, default: "" },
  },
  { timestamps: true }
);

export type SalesProposalDoc = InferSchemaType<typeof salesProposalSchema> & {
  _id: Types.ObjectId;
  status: SalesProposalStatus;
  createdAt: Date;
  updatedAt: Date;
};

export const SalesProposal = models.SalesProposal || model("SalesProposal", salesProposalSchema);
