import { Schema, models, model, type InferSchemaType, Types } from "mongoose";

const serviceCatalogSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true },
    name: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export type ServiceCatalogDoc = InferSchemaType<typeof serviceCatalogSchema> & {
  _id: Types.ObjectId;
};

export const ServiceCatalog =
  models.ServiceCatalog || model("ServiceCatalog", serviceCatalogSchema);
