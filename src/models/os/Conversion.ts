import { Schema, models, model, type InferSchemaType, Types } from "mongoose";
import { RECORD_STATUSES } from "@/lib/os/constants";

const conversionSchema = new Schema(
  {
    conversionUuid: { type: String, required: true, unique: true },
    publicCode: { type: String, required: true, unique: true, uppercase: true },
    /** Optional — direct client onboarding has no sales lead. */
    leadId: {
      type: Schema.Types.ObjectId,
      ref: "OsLead",
      unique: true,
      sparse: true,
      index: true,
    },
    referralId: { type: Schema.Types.ObjectId, ref: "Referral" },
    vendorId: { type: Schema.Types.ObjectId, ref: "OsVendor" },
    conversionValue: { type: Number, default: 0 },
    services: { type: [String], default: [] },
    expectedStart: { type: Date },
    owner: { type: String, default: "" },
    ownerId: { type: Schema.Types.ObjectId, ref: "StaffUser" },
    convertedAt: { type: Date, default: Date.now },
    notes: { type: String, default: "" },
    /** How this conversion was created. */
    origin: {
      type: String,
      enum: ["lead_convert", "direct_client"],
      default: "lead_convert",
    },
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

export type ConversionDoc = InferSchemaType<typeof conversionSchema> & {
  _id: Types.ObjectId;
  conversionUuid: string;
  publicCode: string;
  createdAt: Date;
  updatedAt: Date;
};

export const Conversion =
  models.Conversion || model("Conversion", conversionSchema);
