import { Schema, models, model, type InferSchemaType, Types } from "mongoose";
import { RECORD_STATUSES } from "@/lib/os/constants";
import {
  RECURRING_PAYMENT_FREQUENCIES,
  RECURRING_PAYMENT_STATUSES,
  type RecurringPaymentFrequency,
  type RecurringPaymentStatus,
} from "@/lib/os/recurring-payments";

export {
  RECURRING_PAYMENT_FREQUENCIES,
  RECURRING_PAYMENT_FREQUENCY_LABELS,
  RECURRING_PAYMENT_STATUSES,
  type RecurringPaymentFrequency,
  type RecurringPaymentStatus,
} from "@/lib/os/recurring-payments";

const recurringPaymentSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    payee: { type: String, trim: true, default: "" },
    amount: { type: Number, required: true, min: 0 },
    frequency: {
      type: String,
      enum: RECURRING_PAYMENT_FREQUENCIES,
      default: "monthly",
      index: true,
    },
    nextDueAt: { type: Date, required: true, index: true },
    lastPaidAt: { type: Date },
    lastRemindedAt: { type: Date },
    notes: { type: String, default: "" },
    status: {
      type: String,
      enum: RECURRING_PAYMENT_STATUSES,
      default: "active",
      index: true,
    },
    recordStatus: {
      type: String,
      enum: RECORD_STATUSES,
      default: "active",
      index: true,
    },
    createdBy: { type: String, default: "" },
    updatedBy: { type: String, default: "" },
  },
  { timestamps: true }
);

recurringPaymentSchema.index({ status: 1, nextDueAt: 1 });

export type RecurringPaymentDoc = InferSchemaType<
  typeof recurringPaymentSchema
> & {
  _id: Types.ObjectId;
  frequency: RecurringPaymentFrequency;
  status: RecurringPaymentStatus;
  createdAt: Date;
  updatedAt: Date;
};

export const RecurringPayment =
  models.OsRecurringPayment ||
  model("OsRecurringPayment", recurringPaymentSchema);
