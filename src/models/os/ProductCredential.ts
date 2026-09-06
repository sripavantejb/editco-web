import { Schema, models, model, type InferSchemaType, Types } from "mongoose";
import { RECORD_STATUSES } from "@/lib/os/constants";

const productCredentialSchema = new Schema(
  {
    productName: { type: String, required: true, trim: true, index: true },
    category: { type: String, trim: true, default: "", index: true },
    url: { type: String, trim: true, default: "" },
    username: { type: String, trim: true, default: "" },
    passwordCipher: { type: String, default: "" },
    passwordIv: { type: String, default: "" },
    passwordTag: { type: String, default: "" },
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

productCredentialSchema.index({
  productName: "text",
  category: "text",
  username: "text",
  notes: "text",
});

export type ProductCredentialDoc = InferSchemaType<
  typeof productCredentialSchema
> & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const ProductCredential =
  models.OsProductCredential ||
  model("OsProductCredential", productCredentialSchema);
