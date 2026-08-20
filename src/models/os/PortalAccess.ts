import { Schema, models, model, type InferSchemaType, Types } from "mongoose";

const portalAccessSchema = new Schema(
  {
    conversionUuid: { type: String, required: true, unique: true, index: true },
    token: { type: String, default: "" },
    tokenHash: { type: String, required: true, unique: true },
    tokenHint: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
    createdBy: { type: String, default: "" },
  },
  { timestamps: true }
);

export type PortalAccessDoc = InferSchemaType<typeof portalAccessSchema> & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const PortalAccess =
  models.PortalAccess || model("PortalAccess", portalAccessSchema);
