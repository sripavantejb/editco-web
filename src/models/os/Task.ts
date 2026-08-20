import { Schema, models, model, type InferSchemaType, Types } from "mongoose";
import {
  RECORD_STATUSES,
  TASK_PRIORITIES,
  TASK_STATUSES,
  type TaskPriority,
  type TaskStatus,
} from "@/lib/os/constants";

const taskSchema = new Schema(
  {
    conversionUuid: { type: String, index: true },
    projectId: { type: Schema.Types.ObjectId, ref: "OsProject", index: true },
    leadId: { type: Schema.Types.ObjectId, ref: "OsLead" },
    meetingId: { type: Schema.Types.ObjectId, ref: "OsMeeting" },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    status: {
      type: String,
      enum: TASK_STATUSES,
      default: "todo",
      index: true,
    },
    priority: {
      type: String,
      enum: TASK_PRIORITIES,
      default: "medium",
      index: true,
    },
    /** Legacy display string; kept in sync with assignedToId for portals */
    assignee: { type: String, default: "" },
    assignedToId: {
      type: Schema.Types.ObjectId,
      ref: "StaffUser",
      index: true,
    },
    createdById: {
      type: Schema.Types.ObjectId,
      ref: "StaffUser",
      index: true,
    },
    dueDate: { type: Date, index: true },
    startDate: { type: Date },
    plannedStartTime: { type: Date },
    plannedEndTime: { type: Date },
    actualStartTime: { type: Date },
    actualEndTime: { type: Date },
    completedAt: { type: Date },
    ownerSide: {
      type: String,
      enum: ["editco", "client"],
      default: "editco",
    },
    visibleToClient: { type: Boolean, default: false },
    clientActionRequired: { type: Boolean, default: false },
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

export type TaskDoc = InferSchemaType<typeof taskSchema> & {
  _id: Types.ObjectId;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: Date;
  updatedAt: Date;
};

export const OsTask = models.OsTask || model("OsTask", taskSchema);
