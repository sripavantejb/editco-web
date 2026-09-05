import { Schema, models, model, type InferSchemaType, Types } from "mongoose";

const salesTerritorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    type: { type: String, enum: ["city", "state", "region", "country", "custom"], default: "custom" },
    description: { type: String, default: "" },
    createdBy: { type: String, default: "" },
  },
  { timestamps: true }
);

export type SalesTerritoryDoc = InferSchemaType<typeof salesTerritorySchema> & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const SalesTerritory = models.SalesTerritory || model("SalesTerritory", salesTerritorySchema);
