import { Schema, models, model, type InferSchemaType, Types } from "mongoose";
import {
  DEFAULT_TAX_RATE,
  INVOICE_STATUSES,
  RECORD_STATUSES,
  type InvoiceStatus,
} from "@/lib/os/constants";

const lineItemSchema = new Schema(
  {
    description: { type: String, required: true },
    quantity: { type: Number, default: 1 },
    unitPrice: { type: Number, default: 0 },
  },
  { _id: false }
);

const invoiceSchema = new Schema(
  {
    conversionUuid: { type: String, required: true, index: true },
    invoiceUuid: { type: String, required: true, unique: true },
    invoiceNumber: { type: String, required: true, unique: true },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "OsProject",
      required: true,
      index: true,
    },
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: "OsVendor",
      required: true,
    },
    issueDate: { type: Date, default: Date.now },
    dueDate: { type: Date },
    lineItems: { type: [lineItemSchema], default: [] },
    taxRate: { type: Number, default: DEFAULT_TAX_RATE },
    discount: { type: Number, default: 0 },
    subtotal: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    amountPaid: { type: Number, default: 0 },
    status: { type: String, enum: INVOICE_STATUSES, default: "draft" },
    paymentDate: { type: Date },
    paymentReference: { type: String, default: "" },
    documentNote: { type: String, default: "" },
    billToName: { type: String, default: "" },
    billToAddress: { type: String, default: "" },
    billToEmail: { type: String, default: "" },
    billToPhone: { type: String, default: "" },
    billToGst: { type: String, default: "" },
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

export type InvoiceDoc = InferSchemaType<typeof invoiceSchema> & {
  _id: Types.ObjectId;
  status: InvoiceStatus;
  createdAt: Date;
  updatedAt: Date;
};

export const Invoice = models.OsInvoice || model("OsInvoice", invoiceSchema);
