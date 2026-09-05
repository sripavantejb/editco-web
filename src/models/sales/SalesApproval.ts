import { Schema, models, model, type InferSchemaType, Types } from "mongoose";
import { SALES_APPROVAL_STATUSES, SALES_APPROVAL_TYPES, type SalesApprovalStatus, type SalesApprovalType } from "@/lib/sales/constants";

const salesApprovalSchema = new Schema(
  {
    type: { type: String, enum: SALES_APPROVAL_TYPES, required: true },
    dealId: { type: Schema.Types.ObjectId, ref: "SalesDeal" },
    quotationId: { type: Schema.Types.ObjectId, ref: "SalesQuotation" },
    proposalId: { type: Schema.Types.ObjectId, ref: "SalesProposal" },
    requesterEmployeeId: { type: Schema.Types.ObjectId, ref: "SalesEmployee", required: true, index: true },
    reviewerEmployeeId: { type: Schema.Types.ObjectId, ref: "SalesEmployee" },
    reason: { type: String, default: "" },
    requestedValue: { type: String, default: "" },
    status: { type: String, enum: SALES_APPROVAL_STATUSES, default: "pending", index: true },
    reviewerComment: { type: String, default: "" },
    decidedAt: { type: Date },
  },
  { timestamps: true }
);

export type SalesApprovalDoc = InferSchemaType<typeof salesApprovalSchema> & {
  _id: Types.ObjectId;
  status: SalesApprovalStatus;
  type: SalesApprovalType;
  createdAt: Date;
  updatedAt: Date;
};

export const SalesApproval = models.SalesApproval || model("SalesApproval", salesApprovalSchema);
