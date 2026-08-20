import { Schema, models, model, type InferSchemaType, Types } from "mongoose";

const auditLogSchema = new Schema(
  {
    entityType: { type: String, required: true },
    entityId: { type: String, required: true },
    conversionUuid: { type: String, index: true },
    field: { type: String, required: true },
    oldValue: { type: String, default: "" },
    newValue: { type: String, default: "" },
    reason: { type: String, default: "" },
    createdBy: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export type AuditLogDoc = InferSchemaType<typeof auditLogSchema> & {
  _id: Types.ObjectId;
  createdAt: Date;
};

export const AuditLog = models.OsAuditLog || model("OsAuditLog", auditLogSchema);
