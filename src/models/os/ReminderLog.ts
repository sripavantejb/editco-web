import { Schema, models, model } from "mongoose";

/** One row per (day, slot, recipient) so cron retries never double-send a digest. */
const reminderLogSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    email: { type: String, required: true, lowercase: true },
    slot: { type: String, required: true },
    dayKey: { type: String, required: true, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const ReminderLog = models.OsReminderLog || model("OsReminderLog", reminderLogSchema);
