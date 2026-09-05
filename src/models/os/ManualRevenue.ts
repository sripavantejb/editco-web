import { Schema, models, model, type InferSchemaType, Types } from "mongoose";
import { RECORD_STATUSES } from "@/lib/os/constants";

const manualRevenueSchema = new Schema(
  {
    source: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    amount: { type: Number, required: true },
    receivedAt: { type: Date, default: Date.now },
    notes: { type: String, default: "" },
    recordStatus: { type: String, enum: RECORD_STATUSES, default: "active" },
    createdBy: { type: String, default: "" },
  },
  { timestamps: true }
);

manualRevenueSchema.index({ receivedAt: -1 });

export type ManualRevenueDoc = InferSchemaType<typeof manualRevenueSchema> & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const ManualRevenue = models.OsManualRevenue || model("OsManualRevenue", manualRevenueSchema);
