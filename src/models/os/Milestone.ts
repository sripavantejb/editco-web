import { Schema, models, model, type InferSchemaType, Types } from "mongoose";
import { MILESTONE_STATUSES, RECORD_STATUSES } from "@/lib/os/constants";

const milestoneSchema = new Schema(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "OsProject",
      required: true,
      index: true,
    },
    conversionUuid: { type: String, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    sortOrder: { type: Number, default: 0 },
    status: {
      type: String,
      enum: MILESTONE_STATUSES,
      default: "pending",
    },
    /** Weight for progress calculation (default equal weight if unset). */
    weight: { type: Number, default: 1 },
    dueDate: { type: Date },
    completedAt: { type: Date },
    visibleToClient: { type: Boolean, default: true },
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

milestoneSchema.index({ projectId: 1, sortOrder: 1 });

export type MilestoneDoc = InferSchemaType<typeof milestoneSchema> & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const Milestone = models.OsMilestone || model("OsMilestone", milestoneSchema);
