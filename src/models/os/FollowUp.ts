import { Schema, models, model, type InferSchemaType, Types } from "mongoose";
import { FOLLOWUP_STATUSES, RECORD_STATUSES } from "@/lib/os/constants";

const followUpSchema = new Schema(
  {
    leadId: {
      type: Schema.Types.ObjectId,
      ref: "OsLead",
      required: true,
      index: true,
    },
    callId: { type: Schema.Types.ObjectId, ref: "OsCall" },
    assigneeId: { type: Schema.Types.ObjectId, ref: "StaffUser" },
    assigneeEmail: { type: String, default: "" },
    dueAt: { type: Date, required: true, index: true },
    completedAt: { type: Date },
    status: {
      type: String,
      enum: FOLLOWUP_STATUSES,
      default: "pending",
      index: true,
    },
    notes: { type: String, default: "" },
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

export type FollowUpDoc = InferSchemaType<typeof followUpSchema> & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const FollowUp = models.OsFollowUp || model("OsFollowUp", followUpSchema);
