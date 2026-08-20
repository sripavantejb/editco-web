import { Schema, models, model, type InferSchemaType, Types } from "mongoose";
import {
  PITCH_STATUSES,
  RECORD_STATUSES,
  type PitchStatus,
} from "@/lib/os/constants";

const leadProjectPitchSchema = new Schema(
  {
    leadId: {
      type: Schema.Types.ObjectId,
      ref: "OsLead",
      required: true,
      index: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "OsVaultProject",
      required: true,
      index: true,
    },
    /** Snapshot for historical display if project is archived. */
    projectName: { type: String, default: "" },
    pitchedBy: { type: String, trim: true, default: "" },
    pitchedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: PITCH_STATUSES,
      default: "pitched",
      index: true,
    },
    notes: { type: String, default: "" },
    attemptCount: { type: Number, default: 1 },
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

leadProjectPitchSchema.index(
  { leadId: 1, projectId: 1 },
  { unique: true, partialFilterExpression: { recordStatus: "active" } }
);

export type LeadProjectPitchDoc = InferSchemaType<
  typeof leadProjectPitchSchema
> & {
  _id: Types.ObjectId;
  status: PitchStatus;
  createdAt: Date;
  updatedAt: Date;
};

export const LeadProjectPitch =
  models.OsLeadProjectPitch ||
  model("OsLeadProjectPitch", leadProjectPitchSchema);
