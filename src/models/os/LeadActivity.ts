import { Schema, models, model, type InferSchemaType, Types } from "mongoose";

const leadActivitySchema = new Schema(
  {
    leadId: {
      type: Schema.Types.ObjectId,
      ref: "OsLead",
      required: true,
      index: true,
    },
    eventType: {
      type: String,
      enum: ["created", "status_change", "assignment", "note", "converted"],
      required: true,
    },
    fromStatus: { type: String },
    toStatus: { type: String },
    reason: { type: String, default: "" },
    expectedValue: { type: Number },
    note: { type: String, default: "" },
    createdBy: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export type LeadActivityDoc = InferSchemaType<typeof leadActivitySchema> & {
  _id: Types.ObjectId;
  createdAt: Date;
};

export const LeadActivity =
  models.OsLeadActivity || model("OsLeadActivity", leadActivitySchema);
