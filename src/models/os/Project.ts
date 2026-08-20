import { Schema, models, model, type InferSchemaType, Types } from "mongoose";
import {
  PROJECT_PRIORITIES,
  PROJECT_STATUSES,
  RECORD_STATUSES,
  type ProjectPriority,
  type ProjectStatus,
} from "@/lib/os/constants";

const projectSchema = new Schema(
  {
    conversionUuid: { type: String, required: true, index: true },
    conversionId: { type: Schema.Types.ObjectId, ref: "Conversion" },
    vendorId: { type: Schema.Types.ObjectId, ref: "OsVendor", required: true },
    name: { type: String, required: true, trim: true },
    service: { type: String, default: "" },
    description: { type: String, default: "" },
    startDate: { type: Date },
    expectedDelivery: { type: Date },
    actualCompletion: { type: Date },
    status: {
      type: String,
      enum: PROJECT_STATUSES,
      default: "planned",
      index: true,
    },
    priority: {
      type: String,
      enum: PROJECT_PRIORITIES,
      default: "medium",
    },
    /** @deprecated Prefer primaryPocUserId */
    projectManager: { type: String, default: "" },
    /** @deprecated Prefer ProjectMember relations */
    assignedTeam: { type: String, default: "" },
    primaryPocUserId: {
      type: Schema.Types.ObjectId,
      ref: "StaffUser",
      index: true,
    },
    budget: { type: Number, default: 0 },
    /** Derived from milestones when milestones exist; otherwise staff-set. */
    progress: { type: Number, default: 0 },
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

export type ProjectDoc = InferSchemaType<typeof projectSchema> & {
  _id: Types.ObjectId;
  status: ProjectStatus;
  priority: ProjectPriority;
  createdAt: Date;
  updatedAt: Date;
};

export const Project = models.OsProject || model("OsProject", projectSchema);
