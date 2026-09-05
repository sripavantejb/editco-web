import { Schema, models, model, type InferSchemaType, Types } from "mongoose";
import { SALES_ATTENDANCE_STATUSES, type SalesAttendanceStatus } from "@/lib/sales/constants";

/**
 * Self-serve check-in/out, one doc per employee per day. This is a thin,
 * honest placeholder — not a biometric/HR system integration. If Editco
 * connects an external attendance API later, replace the write path here
 * (checkIn/checkOut actions) with that integration; the read side (this
 * model + the dashboard pages) stays the same.
 */
const salesAttendanceSchema = new Schema(
  {
    employeeId: { type: Schema.Types.ObjectId, ref: "SalesEmployee", required: true, index: true },
    date: { type: String, required: true }, // YYYY-MM-DD, one record per employee per day
    status: { type: String, enum: SALES_ATTENDANCE_STATUSES, default: "present" },
    checkInAt: { type: Date },
    checkOutAt: { type: Date },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

salesAttendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

export type SalesAttendanceDoc = InferSchemaType<typeof salesAttendanceSchema> & {
  _id: Types.ObjectId;
  status: SalesAttendanceStatus;
  createdAt: Date;
  updatedAt: Date;
};

export const SalesAttendance = models.SalesAttendance || model("SalesAttendance", salesAttendanceSchema);
