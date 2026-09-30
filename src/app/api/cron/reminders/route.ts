import { NextResponse } from "next/server";
import { runDailyReminders, runDeadlineReminders, type ReminderSlot } from "@/lib/os/reminders";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Vercel Cron sends `Authorization: Bearer $CRON_SECRET`; anything else is rejected. */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const slotParam = new URL(req.url).searchParams.get("slot");
  const slot: ReminderSlot = slotParam === "evening" ? "evening" : "morning";

  try {
    const result = slotParam === "deadline" ? await runDeadlineReminders() : await runDailyReminders(slot);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("[cron/reminders] failed:", err);
    return NextResponse.json({ ok: false, error: "Reminder run failed" }, { status: 500 });
  }
}
