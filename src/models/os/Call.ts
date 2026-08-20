import { Schema, models, model, type InferSchemaType, Types } from "mongoose";
import { CALL_OUTCOMES, RECORD_STATUSES } from "@/lib/os/constants";

const callSchema = new Schema(
  {
    leadId: {
      type: Schema.Types.ObjectId,
      ref: "OsLead",
      required: true,
      index: true,
    },
    callerId: { type: Schema.Types.ObjectId, ref: "StaffUser" },
    callerEmail: { type: String, default: "" },
    startedAt: { type: Date, required: true },
    endedAt: { type: Date },
    durationSeconds: { type: Number, default: 0 },
    outcome: { type: String, enum: CALL_OUTCOMES, default: "other" },
    notes: { type: String, default: "" },
    nextFollowUp: { type: Date },
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

callSchema.index({ startedAt: -1 });

export type CallDoc = InferSchemaType<typeof callSchema> & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const Call = models.OsCall || model("OsCall", callSchema);
