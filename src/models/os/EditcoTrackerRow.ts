import { Schema, models, model, type InferSchemaType, Types } from "mongoose";

export const EDITCO_TRACKER_STATUSES = [
  "started",
  "in_progress",
  "completed",
  "not_needed",
  "blocked",
  "recursive",
  "not_yet_started",
] as const;
export type EditcoTrackerStatus = (typeof EDITCO_TRACKER_STATUSES)[number];

export const EDITCO_TRACKER_STATUS_LABELS: Record<EditcoTrackerStatus, string> = {
  started: "Started",
  in_progress: "In Progress",
  completed: "Completed",
  not_needed: "Not needed / cancelled",
  blocked: "Blocked",
  recursive: "Recursive",
  not_yet_started: "Not Yet started",
};

/** Matches the team's spreadsheet status chip colors. */
export const EDITCO_TRACKER_STATUS_CLASSES: Record<EditcoTrackerStatus, string> = {
  started: "bg-rose-400/20 text-rose-300",
  in_progress: "bg-amber-400/20 text-amber-300",
  completed: "bg-emerald-400/20 text-emerald-300",
  not_needed: "bg-slate-400/20 text-slate-300",
  blocked: "bg-purple-400/20 text-purple-300",
  recursive: "bg-pink-400/20 text-pink-300",
  not_yet_started: "bg-red-400/20 text-red-300",
};

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
