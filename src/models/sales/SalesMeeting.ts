import { Schema, models, model, type InferSchemaType, Types } from "mongoose";
import { SALES_MEETING_STATUSES, SALES_MEETING_TYPES, type SalesMeetingStatus, type SalesMeetingType } from "@/lib/sales/constants";

const salesMeetingSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    leadId: { type: Schema.Types.ObjectId, ref: "SalesLead" },
    dealId: { type: Schema.Types.ObjectId, ref: "SalesDeal" },
    customerId: { type: Schema.Types.ObjectId, ref: "SalesCustomer" },
    ownerEmployeeId: { type: Schema.Types.ObjectId, ref: "SalesEmployee", required: true, index: true },
    participants: { type: [String], default: [] },
    type: { type: String, enum: SALES_MEETING_TYPES, default: "discovery" },
    startsAt: { type: Date, required: true },
    location: { type: String, trim: true, default: "" },
    status: { type: String, enum: SALES_MEETING_STATUSES, default: "scheduled", index: true },
    agenda: { type: String, default: "" },
    notes: { type: String, default: "" },
    decisions: { type: String, default: "" },
    nextSteps: { type: String, default: "" },
    createdBy: { type: String, default: "" },
  },
  { timestamps: true }
);

salesMeetingSchema.index({ ownerEmployeeId: 1, startsAt: 1 });

export type SalesMeetingDoc = InferSchemaType<typeof salesMeetingSchema> & {
  _id: Types.ObjectId;
  status: SalesMeetingStatus;
  type: SalesMeetingType;
  createdAt: Date;
  updatedAt: Date;
};

export const SalesMeeting = models.SalesMeeting || model("SalesMeeting", salesMeetingSchema);
