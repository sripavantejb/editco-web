import { Schema, models, model, type InferSchemaType, Types } from "mongoose";
import { PROPOSAL_STATUSES, RECORD_STATUSES } from "@/lib/os/constants";

const proposalSchema = new Schema(
  {
    leadId: {
      type: Schema.Types.ObjectId,
      ref: "OsLead",
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    summary: { type: String, default: "" },
    amount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: PROPOSAL_STATUSES,
      default: "draft",
      index: true,
    },
    sentAt: { type: Date },
    viewedAt: { type: Date },
    acceptedAt: { type: Date },
    rejectedAt: { type: Date },
    expiresAt: { type: Date },
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

export type ProposalDoc = InferSchemaType<typeof proposalSchema> & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const Proposal = models.OsProposal || model("OsProposal", proposalSchema);
