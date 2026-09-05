import { Schema, models, model, type InferSchemaType, Types } from "mongoose";

/** Tracks sensitive changes: permission edits, assignments, stage/status changes, approvals (spec §44). */
const salesAuditLogSchema = new Schema(
  {
    action: { type: String, required: true, trim: true }, // e.g. "permission_changed", "lead_assigned"
    entityType: { type: String, required: true, trim: true },
    entityId: { type: String, default: "" },
    field: { type: String, default: "" },
    oldValue: { type: String, default: "" },
    newValue: { type: String, default: "" },
    reason: { type: String, default: "" },
    actorEmail: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

salesAuditLogSchema.index({ createdAt: -1 });
salesAuditLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });

export type SalesAuditLogDoc = InferSchemaType<typeof salesAuditLogSchema> & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const SalesAuditLog = models.SalesAuditLog || model("SalesAuditLog", salesAuditLogSchema);
