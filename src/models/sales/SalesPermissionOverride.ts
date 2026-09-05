import { Schema, models, model, type InferSchemaType, Types } from "mongoose";

const salesPermissionOverrideSchema = new Schema(
  {
    salesEmployeeId: { type: Schema.Types.ObjectId, ref: "SalesEmployee", required: true, unique: true },
    // Sparse plain object: only modules explicitly toggled away from the role default are stored
    // here. Module keys are dotted (e.g. "dashboard.sales") — Mixed is used instead of Mongoose's
    // Map type because Map rejects keys containing ".".
    overrides: { type: Schema.Types.Mixed, default: () => ({}) },
    updatedBy: { type: String, default: "" },
  },
  { timestamps: true }
);

export type SalesPermissionOverrideDoc = InferSchemaType<typeof salesPermissionOverrideSchema> & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const SalesPermissionOverride =
  models.SalesPermissionOverride || model("SalesPermissionOverride", salesPermissionOverrideSchema);
