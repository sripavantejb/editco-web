import { Schema, models, model, type InferSchemaType, Types } from "mongoose";
import {
  RECORD_STATUSES,
  VAULT_PROJECT_STATUSES,
  type VaultProjectStatus,
} from "@/lib/os/constants";

const vaultProjectSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    localUrl: { type: String, trim: true, default: "" },
    productionUrl: { type: String, trim: true, default: "" },
    loginEmail: { type: String, trim: true, lowercase: true, default: "" },
    passwordCipher: { type: String, default: "" },
    passwordIv: { type: String, default: "" },
    passwordTag: { type: String, default: "" },
    description: { type: String, default: "" },
    category: { type: String, trim: true, default: "", index: true },
    status: {
      type: String,
      enum: VAULT_PROJECT_STATUSES,
      default: "active",
      index: true,
    },
    targetIndustry: { type: String, default: "" },
    idealCustomer: { type: String, default: "" },
    sellingPoints: { type: String, default: "" },
    commonObjections: { type: String, default: "" },
    bestPitchAngle: { type: String, default: "" },
    pricingNotes: { type: String, default: "" },
    competitors: { type: String, default: "" },
    demoNotes: { type: String, default: "" },
    internalNotes: { type: String, default: "" },
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

vaultProjectSchema.index({ name: "text", category: "text", loginEmail: "text" });

export type VaultProjectDoc = InferSchemaType<typeof vaultProjectSchema> & {
  _id: Types.ObjectId;
  status: VaultProjectStatus;
  createdAt: Date;
  updatedAt: Date;
};

export const VaultProject =
  models.OsVaultProject || model("OsVaultProject", vaultProjectSchema);
