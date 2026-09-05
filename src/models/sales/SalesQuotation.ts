import { Schema, models, model, type InferSchemaType, Types } from "mongoose";
import { SALES_QUOTATION_STATUSES, type SalesQuotationStatus } from "@/lib/sales/constants";

const quotationItemSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    quantity: { type: Number, default: 1 },
    price: { type: Number, default: 0 },
  },
  { _id: false }
);

const salesQuotationSchema = new Schema(
  {
    quotationNumber: { type: String, required: true, unique: true },
    customerId: { type: Schema.Types.ObjectId, ref: "SalesCustomer" },
    leadId: { type: Schema.Types.ObjectId, ref: "SalesLead" },
    dealId: { type: Schema.Types.ObjectId, ref: "SalesDeal" },
    ownerEmployeeId: { type: Schema.Types.ObjectId, ref: "SalesEmployee", required: true, index: true },
    customerName: { type: String, trim: true, default: "" },
    items: { type: [quotationItemSchema], default: [] },
    discountPercent: { type: Number, default: 0 },
    taxPercent: { type: Number, default: 18 },
    validUntil: { type: Date },
    terms: { type: String, default: "" },
    notes: { type: String, default: "" },
    status: { type: String, enum: SALES_QUOTATION_STATUSES, default: "draft", index: true },
    version: { type: Number, default: 1 },
    previousVersionId: { type: Schema.Types.ObjectId, ref: "SalesQuotation" },
    createdBy: { type: String, default: "" },
    updatedBy: { type: String, default: "" },
  },
  { timestamps: true }
);

export type SalesQuotationDoc = InferSchemaType<typeof salesQuotationSchema> & {
  _id: Types.ObjectId;
  status: SalesQuotationStatus;
  createdAt: Date;
  updatedAt: Date;
};

export const SalesQuotation = models.SalesQuotation || model("SalesQuotation", salesQuotationSchema);
