import { Schema, models, model, type InferSchemaType, Types } from "mongoose";
import { SALES_CALL_OUTCOMES, type SalesCallOutcome } from "@/lib/sales/constants";

const salesCallSchema = new Schema(
  {
    leadId: { type: Schema.Types.ObjectId, ref: "SalesLead" },
    dealId: { type: Schema.Types.ObjectId, ref: "SalesDeal" },
    customerId: { type: Schema.Types.ObjectId, ref: "SalesCustomer" },
    employeeId: { type: Schema.Types.ObjectId, ref: "SalesEmployee", required: true, index: true },
    calledAt: { type: Date, default: Date.now },
    durationMinutes: { type: Number, default: 0 },
    outcome: { type: String, enum: SALES_CALL_OUTCOMES, default: "connected" },
    notes: { type: String, default: "" },
    nextAction: { type: String, trim: true, default: "" },
    nextFollowUpAt: { type: Date },
    createdBy: { type: String, default: "" },
  },
  { timestamps: true }
);

salesCallSchema.index({ employeeId: 1, calledAt: -1 });
salesCallSchema.index({ leadId: 1, calledAt: -1 });
salesCallSchema.index({ customerId: 1, calledAt: -1 });

export type SalesCallDoc = InferSchemaType<typeof salesCallSchema> & {
  _id: Types.ObjectId;
  outcome: SalesCallOutcome;
  createdAt: Date;
  updatedAt: Date;
};

export const SalesCall = models.SalesCall || model("SalesCall", salesCallSchema);
