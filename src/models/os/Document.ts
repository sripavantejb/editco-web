import { Schema, models, model, type InferSchemaType, Types } from "mongoose";
import { RECORD_STATUSES } from "@/lib/os/constants";

const documentSchema = new Schema(
  {
    conversionUuid: { type: String, required: true, index: true },
    projectId: { type: Schema.Types.ObjectId, ref: "OsProject" },
    vendorId: { type: Schema.Types.ObjectId, ref: "OsVendor" },
    title: { type: String, required: true, trim: true },
    fileName: { type: String, default: "" },
    mimeType: { type: String, default: "" },
    dataBase64: { type: String, default: "" },
    visibleToClient: { type: Boolean, default: false },
    recordStatus: {
      type: String,
      enum: RECORD_STATUSES,
      default: "active",
    },
    createdBy: { type: String, default: "" },
    updatedBy: { type: String, default: "" },
  },
  { timestamps: true }
);

export type DocumentDoc = InferSchemaType<typeof documentSchema> & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const OsDocument =
  models.OsDocument || model("OsDocument", documentSchema);
