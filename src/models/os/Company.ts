import { Schema, models, model, type InferSchemaType, Types } from "mongoose";
import { RECORD_STATUSES } from "@/lib/os/constants";

const companySchema = new Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    industry: { type: String, default: "" },
    website: { type: String, default: "" },
    address: { type: String, default: "" },
    gstNumber: { type: String, default: "" },
    phone: { type: String, default: "" },
    email: { type: String, lowercase: true, trim: true, default: "" },
    notes: { type: String, default: "" },
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

companySchema.index({ name: "text" });

export type CompanyDoc = InferSchemaType<typeof companySchema> & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const Company = models.OsCompany || model("OsCompany", companySchema);
