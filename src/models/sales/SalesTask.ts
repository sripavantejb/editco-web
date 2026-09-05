import { Schema, models, model, type InferSchemaType, Types } from "mongoose";

const SALES_TASK_STATUSES = ["todo", "in_progress", "completed", "overdue"] as const;
export type SalesTaskStatus = (typeof SALES_TASK_STATUSES)[number];

const salesTaskSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    ownerEmployeeId: { type: Schema.Types.ObjectId, ref: "SalesEmployee", index: true },
    leadId: { type: Schema.Types.ObjectId, ref: "SalesLead" },
    dealId: { type: Schema.Types.ObjectId, ref: "SalesDeal" },
    customerId: { type: Schema.Types.ObjectId, ref: "SalesCustomer" },
    priority: { type: String, enum: ["low", "medium", "high", "urgent"], default: "medium" },
    dueDate: { type: Date },
    status: { type: String, enum: SALES_TASK_STATUSES, default: "todo", index: true },
    createdBy: { type: String, default: "" },
  },
  { timestamps: true }
);

export type SalesTaskDoc = InferSchemaType<typeof salesTaskSchema> & {
  _id: Types.ObjectId;
  status: SalesTaskStatus;
  createdAt: Date;
  updatedAt: Date;
};

export const SalesTask = models.SalesTask || model("SalesTask", salesTaskSchema);
