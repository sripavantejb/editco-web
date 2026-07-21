import { Schema, models, model, type InferSchemaType, Types } from "mongoose";

const adminUserSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export type AdminUserDoc = InferSchemaType<typeof adminUserSchema> & {
  _id: Types.ObjectId;
  createdAt: Date;
};

export const AdminUser =
  models.AdminUser || model("AdminUser", adminUserSchema);
