import { Schema, models, model, type InferSchemaType, Types } from "mongoose";
import { RECORD_STATUSES } from "@/lib/os/constants";
import { TRANSACTION_HISTORY_ACTIONS } from "@/lib/os/transactions";

const historyEntrySchema = new Schema(
  {
    action: { type: String, enum: TRANSACTION_HISTORY_ACTIONS, required: true },
    changes: {
      type: [
        new Schema(
          {
            field: { type: String, required: true },
            from: { type: String, default: "" },
            to: { type: String, default: "" },
          },
          { _id: false }
        ),
      ],
      default: [],
    },
    by: { type: String, default: "" },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const manualRevenueSchema = new Schema(
  {
    source: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    amount: { type: Number, required: true },
    receivedAt: { type: Date, default: Date.now },
    projectId: { type: Schema.Types.ObjectId, ref: "OsProject" },
    vendorId: { type: Schema.Types.ObjectId, ref: "OsVendor" },
    paymentMethod: { type: String, default: "" },
    reference: { type: String, default: "" },
    notes: { type: String, default: "" },
    history: { type: [historyEntrySchema], default: [] },
    recordStatus: { type: String, enum: RECORD_STATUSES, default: "active" },
    createdBy: { type: String, default: "" },
    updatedBy: { type: String, default: "" },
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
