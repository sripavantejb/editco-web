import { Schema, models, model, type InferSchemaType, Types } from "mongoose";
import { SALES_RECORD_STATUSES } from "@/lib/sales/constants";

const salesCustomerSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    company: { type: String, trim: true, default: "" },
    industry: { type: String, trim: true, default: "" },
    city: { type: String, trim: true, default: "" },
    state: { type: String, trim: true, default: "" },
    country: { type: String, trim: true, default: "" },
    ownerEmployeeId: { type: Schema.Types.ObjectId, ref: "SalesEmployee", index: true },
    sourceLeadId: { type: Schema.Types.ObjectId, ref: "SalesLead" },
    customerSince: { type: Date, default: Date.now },
    totalRevenue: { type: Number, default: 0 },
    tags: { type: [String], default: [] },
    notes: { type: String, default: "" },
    recordStatus: { type: String, enum: SALES_RECORD_STATUSES, default: "active", index: true },
    createdBy: { type: String, default: "" },
    updatedBy: { type: String, default: "" },
  },
  { timestamps: true }
);

export type SalesCustomerDoc = InferSchemaType<typeof salesCustomerSchema> & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const SalesCustomer = models.SalesCustomer || model("SalesCustomer", salesCustomerSchema);
