import { Schema, models, model, type InferSchemaType, Types } from "mongoose";
import { RECORD_STATUSES } from "@/lib/os/constants";

const paymentSchema = new Schema(
  {
    conversionUuid: { type: String, required: true, index: true },
    invoiceId: {
      type: Schema.Types.ObjectId,
      ref: "OsInvoice",
      required: true,
      index: true,
    },
    projectId: { type: Schema.Types.ObjectId, ref: "OsProject" },
    vendorId: { type: Schema.Types.ObjectId, ref: "OsVendor" },
    amount: { type: Number, required: true },
    paidAt: { type: Date, default: Date.now },
    method: { type: String, default: "bank" },
    reference: { type: String, default: "" },
    notes: { type: String, default: "" },
    recordStatus: {
      type: String,
      enum: RECORD_STATUSES,
      default: "active",
    },
    createdBy: { type: String, default: "" },
    updatedBy: { type: String, default: "" },
  },
  { timestamps: true }
);

export type PaymentDoc = InferSchemaType<typeof paymentSchema> & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const Payment = models.OsPayment || model("OsPayment", paymentSchema);
