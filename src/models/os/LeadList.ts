import { Schema, models, model, type InferSchemaType, Types } from "mongoose";
import { RECORD_STATUSES } from "@/lib/os/constants";

const leadListSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    /** Dynamic filter definition — resolved at query time, never copies leads. */
    filters: { type: Schema.Types.Mixed, default: {} },
    sortBy: { type: String, default: "updatedAt" },
    sortDir: { type: String, enum: ["asc", "desc"], default: "desc" },
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

export type LeadListFilters = {
  status?: string[];
  source?: string[];
  priority?: string[];
  industry?: string;
  assignedOwner?: string;
  excludeStatuses?: string[];
};

export type LeadListDoc = InferSchemaType<typeof leadListSchema> & {
  _id: Types.ObjectId;
  filters: LeadListFilters;
  createdAt: Date;
  updatedAt: Date;
};

export const LeadList = models.OsLeadList || model("OsLeadList", leadListSchema);
