import { Schema, models, model, type InferSchemaType, Types } from "mongoose";
import type { Tier } from "@/lib/constants";

const referrerSchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: { type: String, trim: true },
    referralCode: { type: String, required: true, unique: true, uppercase: true },
    tier: {
      type: String,
      enum: ["standard", "growth_partner", "elite_partner"],
      default: "standard",
    },
    successfulReferralCount: { type: Number, default: 0 },
    totalRewardEarned: { type: Number, default: 0 },
    totalRewardPaid: { type: Number, default: 0 },
    isPublicPartner: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

export type ReferrerDoc = InferSchemaType<typeof referrerSchema> & {
  _id: Types.ObjectId;
  tier: Tier;
  createdAt: Date;
  updatedAt: Date;
};

export const Referrer =
  models.Referrer || model("Referrer", referrerSchema);
