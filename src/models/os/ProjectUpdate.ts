import { Schema, models, model, type InferSchemaType, Types } from "mongoose";
import { RECORD_STATUSES, VISIBILITY_LEVELS } from "@/lib/os/constants";

const projectUpdateSchema = new Schema(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "OsProject",
      required: true,
      index: true,
    },
    conversionUuid: { type: String, index: true },
    title: { type: String, required: true, trim: true },
    body: { type: String, default: "" },
    visibility: {
      type: String,
      enum: VISIBILITY_LEVELS,
      default: "internal",
    },
    publishedAt: { type: Date },
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

projectUpdateSchema.index({ projectId: 1, publishedAt: -1 });

export type ProjectUpdateDoc = InferSchemaType<typeof projectUpdateSchema> & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const ProjectUpdate =
  models.OsProjectUpdate || model("OsProjectUpdate", projectUpdateSchema);
