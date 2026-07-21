import { Schema, models, model, type InferSchemaType, Types } from "mongoose";

const referralActivitySchema = new Schema(
  {
    referralId: {
      type: Schema.Types.ObjectId,
      ref: "Referral",
      required: true,
      index: true,
    },
    eventType: {
      type: String,
      enum: ["created", "stage_change", "note_added", "reward_calculated"],
      required: true,
    },
    fromStage: { type: String },
    toStage: { type: String },
    note: { type: String },
    createdBy: { type: String, required: true },
    referrerVisible: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export type ReferralActivityDoc = InferSchemaType<
  typeof referralActivitySchema
> & {
  _id: Types.ObjectId;
  createdAt: Date;
};

export const ReferralActivity =
  models.ReferralActivity ||
  model("ReferralActivity", referralActivitySchema);
