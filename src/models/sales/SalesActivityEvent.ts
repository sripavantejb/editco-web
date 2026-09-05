import { Schema, models, model, type InferSchemaType, Types } from "mongoose";

/** Unified timeline entry — powers the Activity Timeline for employees, leads, customers, and deals (spec §26). */
const salesActivityEventSchema = new Schema(
  {
    type: { type: String, required: true, trim: true }, // e.g. "lead_created", "deal_moved", "call_logged"
    title: { type: String, required: true, trim: true },
    detail: { type: String, default: "" },
    actorEmployeeId: { type: Schema.Types.ObjectId, ref: "SalesEmployee" },
    actorName: { type: String, trim: true, default: "" },
    leadId: { type: Schema.Types.ObjectId, ref: "SalesLead" },
    dealId: { type: Schema.Types.ObjectId, ref: "SalesDeal" },
    customerId: { type: Schema.Types.ObjectId, ref: "SalesCustomer" },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

salesActivityEventSchema.index({ createdAt: -1 });
salesActivityEventSchema.index({ leadId: 1, createdAt: -1 });
salesActivityEventSchema.index({ dealId: 1, createdAt: -1 });
salesActivityEventSchema.index({ customerId: 1, createdAt: -1 });
salesActivityEventSchema.index({ actorEmployeeId: 1, createdAt: -1 });

export type SalesActivityEventDoc = InferSchemaType<typeof salesActivityEventSchema> & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const SalesActivityEvent = models.SalesActivityEvent || model("SalesActivityEvent", salesActivityEventSchema);
