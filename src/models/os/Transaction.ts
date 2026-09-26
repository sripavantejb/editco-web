import { Schema, models, model, type InferSchemaType, Types } from "mongoose";
import { RECORD_STATUSES } from "@/lib/os/constants";
import {
  TRANSACTION_HISTORY_ACTIONS,
  TRANSACTION_PAYMENT_METHODS,
  TRANSACTION_TYPES,
  type TransactionType,
} from "@/lib/os/transactions";

const historyChangeSchema = new Schema(
  {
    field: { type: String, required: true },
    from: { type: String, default: "" },
    to: { type: String, default: "" },
  },
  { _id: false }
);

const historyEntrySchema = new Schema(
  {
    action: { type: String, enum: TRANSACTION_HISTORY_ACTIONS, required: true },
    changes: { type: [historyChangeSchema], default: [] },
    by: { type: String, default: "" },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const transactionSchema = new Schema(
  {
    type: { type: String, enum: TRANSACTION_TYPES, required: true, index: true },
    title: { type: String, required: true, trim: true },
    category: { type: String, trim: true, default: "" },
    amount: { type: Number, required: true, min: 0 },
    date: { type: Date, required: true, index: true },
    party: { type: String, trim: true, default: "" },
    paymentMethod: { type: String, enum: TRANSACTION_PAYMENT_METHODS, default: "upi" },
    reference: { type: String, trim: true, default: "" },
    notes: { type: String, default: "" },
    history: { type: [historyEntrySchema], default: [] },
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

transactionSchema.index({ recordStatus: 1, date: -1 });

export type TransactionDoc = InferSchemaType<typeof transactionSchema> & {
  _id: Types.ObjectId;
  type: TransactionType;
  createdAt: Date;
  updatedAt: Date;
};

export const Transaction =
  models.OsTransaction || model("OsTransaction", transactionSchema);
