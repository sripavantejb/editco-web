import { Schema, models, model, type InferSchemaType, Types } from "mongoose";
import {
  EDITCO_TRACKER_STATUSES,
  type EditcoTrackerStatus,
} from "@/lib/os/editco-tracker";

export {
  EDITCO_TEAM_NAMES,
  EDITCO_TEAM_EMAILS,
  EDITCO_TRACKER_STATUSES,
  EDITCO_TRACKER_STATUS_LABELS,
  EDITCO_TRACKER_STATUS_CLASSES,
  type EditcoTeamName,
  type EditcoTrackerStatus,
} from "@/lib/os/editco-tracker";

const historyEntrySchema = new Schema(
  {
    at: { type: Date, default: Date.now },
    byEmail: { type: String, default: "" },
    byName: { type: String, default: "" },
    field: { type: String, default: "" },
    from: { type: String, default: "" },
    to: { type: String, default: "" },
  },
  { _id: false }
);

const editcoTrackerRowSchema = new Schema(
  {
    date: { type: Date, required: true },
    projectName: { type: String, required: true, trim: true },
    taskName: { type: String, required: true, trim: true },
    dependency: { type: [String], default: [] },
    poc: { type: String, trim: true, default: "" },
    status: { type: String, enum: EDITCO_TRACKER_STATUSES, default: "not_yet_started", index: true },
    remarks: { type: String, default: "" },
    createdBy: { type: String, default: "" },
    updatedBy: { type: String, default: "" },
    history: { type: [historyEntrySchema], default: [] },
  },
  { timestamps: true }
);

editcoTrackerRowSchema.index({ date: -1 });

export type EditcoTrackerRowDoc = InferSchemaType<typeof editcoTrackerRowSchema> & {
  _id: Types.ObjectId;
  status: EditcoTrackerStatus;
  createdAt: Date;
  updatedAt: Date;
};

export const EditcoTrackerRow = models.EditcoTrackerRow || model("EditcoTrackerRow", editcoTrackerRowSchema);

/** One check-in per person per calendar day when they open Master Tracker. */
const editcoTrackerCheckInSchema = new Schema(
  {
    email: { type: String, required: true, lowercase: true, index: true },
    dayKey: { type: String, required: true, index: true }, // YYYY-MM-DD
    checkedInAt: { type: Date, required: true },
    name: { type: String, default: "" },
  },
  { timestamps: true }
);

editcoTrackerCheckInSchema.index({ email: 1, dayKey: 1 }, { unique: true });

export type EditcoTrackerCheckInDoc = InferSchemaType<typeof editcoTrackerCheckInSchema> & {
  _id: Types.ObjectId;
};

export const EditcoTrackerCheckIn =
  models.EditcoTrackerCheckIn || model("EditcoTrackerCheckIn", editcoTrackerCheckInSchema);
