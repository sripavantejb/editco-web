import { Schema, models, model, type InferSchemaType, Types } from "mongoose";
import { MEETING_TYPES, RECORD_STATUSES } from "@/lib/os/constants";

const meetingSchema = new Schema(
  {
    conversionUuid: { type: String, required: true, index: true },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "OsProject",
      required: true,
      index: true,
    },
    vendorId: { type: Schema.Types.ObjectId, ref: "OsVendor" },
    title: { type: String, required: true, trim: true },
    startsAt: { type: Date, required: true },
    participants: { type: String, default: "" },
    meetingType: { type: String, enum: MEETING_TYPES, default: "other" },
    discussion: { type: String, default: "" },
    decisions: { type: String, default: "" },
    actionItems: { type: String, default: "" },
    nextFollowUp: { type: Date },
    attachmentsNote: { type: String, default: "" },
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

export type MeetingDoc = InferSchemaType<typeof meetingSchema> & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const Meeting = models.OsMeeting || model("OsMeeting", meetingSchema);
