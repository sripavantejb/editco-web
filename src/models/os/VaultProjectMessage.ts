import { Schema, models, model, type InferSchemaType, Types } from "mongoose";
import {
  VAULT_MESSAGE_TYPES,
  type VaultMessageType,
} from "@/lib/os/constants";

const vaultProjectMessageSchema = new Schema(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "OsVaultProject",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: VAULT_MESSAGE_TYPES,
      required: true,
    },
    subject: { type: String, default: "" },
    body: { type: String, default: "" },
    updatedBy: { type: String, default: "" },
  },
  { timestamps: true }
);

vaultProjectMessageSchema.index({ projectId: 1, type: 1 }, { unique: true });

export type VaultProjectMessageDoc = InferSchemaType<
  typeof vaultProjectMessageSchema
> & {
  _id: Types.ObjectId;
  type: VaultMessageType;
  createdAt: Date;
  updatedAt: Date;
};

export const VaultProjectMessage =
  models.OsVaultProjectMessage ||
  model("OsVaultProjectMessage", vaultProjectMessageSchema);
