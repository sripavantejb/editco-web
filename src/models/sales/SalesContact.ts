import { Schema, models, model, type InferSchemaType, Types } from "mongoose";

const salesContactSchema = new Schema(
  {
    customerId: { type: Schema.Types.ObjectId, ref: "SalesCustomer", required: true, index: true },
    name: { type: String, required: true, trim: true },
    role: { type: String, trim: true, default: "" },
    email: { type: String, lowercase: true, trim: true, default: "" },
    phone: { type: String, trim: true, default: "" },
    isPrimary: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export type SalesContactDoc = InferSchemaType<typeof salesContactSchema> & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const SalesContact = models.SalesContact || model("SalesContact", salesContactSchema);
