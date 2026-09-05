import { Schema, models, model, type InferSchemaType, Types } from "mongoose";
import { SALES_EMPLOYEE_STATUSES, type SalesEmployeeStatus } from "@/lib/sales/constants";

const salesEmployeeSchema = new Schema(
  {
    staffUserId: { type: Schema.Types.ObjectId, ref: "StaffUser", required: true, unique: true },
    employeeCode: { type: String, trim: true, unique: true, sparse: true },
    isSalesAdmin: { type: Boolean, default: false, index: true },
    department: { type: String, trim: true, default: "Sales" },
    team: { type: String, trim: true, default: "" },
    managerId: { type: Schema.Types.ObjectId, ref: "SalesEmployee" },
    territory: { type: String, trim: true, default: "" },
    status: { type: String, enum: SALES_EMPLOYEE_STATUSES, default: "active", index: true },
    phone: { type: String, trim: true, default: "" },
    joinedAt: { type: Date, default: Date.now },
    createdBy: { type: String, default: "" },
    updatedBy: { type: String, default: "" },
  },
  { timestamps: true }
);

export type SalesEmployeeDoc = InferSchemaType<typeof salesEmployeeSchema> & {
  _id: Types.ObjectId;
  status: SalesEmployeeStatus;
  createdAt: Date;
  updatedAt: Date;
};

export const SalesEmployee = models.SalesEmployee || model("SalesEmployee", salesEmployeeSchema);
