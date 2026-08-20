import { Schema, models, model, type InferSchemaType, Types } from "mongoose";
import { RECORD_STATUSES } from "@/lib/os/constants";

const contactSchema = new Schema(
  {
    companyId: { type: Schema.Types.ObjectId, ref: "OsCompany", index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true, default: "" },
    phone: { type: String, trim: true, default: "" },
    jobTitle: { type: String, default: "" },
    isPrimary: { type: Boolean, default: false },
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

contactSchema.index({ email: 1 });
contactSchema.index({ phone: 1 });

export type ContactDoc = InferSchemaType<typeof contactSchema> & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const Contact = models.OsContact || model("OsContact", contactSchema);
