import { Schema, models, model, type InferSchemaType, Types } from "mongoose";

const SALES_TARGET_PERIODS = ["daily", "weekly", "monthly", "quarterly"] as const;
export type SalesTargetPeriod = (typeof SALES_TARGET_PERIODS)[number];

const salesTargetSchema = new Schema(
  {
    employeeId: { type: Schema.Types.ObjectId, ref: "SalesEmployee", index: true },
    team: { type: String, trim: true, default: "" },
    period: { type: String, enum: SALES_TARGET_PERIODS, default: "monthly" },
    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },
    targetValue: { type: Number, default: 0 },
    createdBy: { type: String, default: "" },
  },
  { timestamps: true }
);

export type SalesTargetDoc = InferSchemaType<typeof salesTargetSchema> & {
  _id: Types.ObjectId;
  period: SalesTargetPeriod;
  createdAt: Date;
  updatedAt: Date;
};

export const SalesTarget = models.SalesTarget || model("SalesTarget", salesTargetSchema);
