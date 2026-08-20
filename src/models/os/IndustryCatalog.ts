import { Schema, models, model, type InferSchemaType, Types } from "mongoose";
import { INDUSTRY_SECTORS } from "@/lib/os/constants";

const industryCatalogSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true },
    name: { type: String, required: true, trim: true },
    sector: {
      type: String,
      enum: INDUSTRY_SECTORS,
      default: "Other",
      index: true,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export type IndustryCatalogDoc = InferSchemaType<typeof industryCatalogSchema> & {
  _id: Types.ObjectId;
};

export const IndustryCatalog =
  models.IndustryCatalog || model("IndustryCatalog", industryCatalogSchema);
