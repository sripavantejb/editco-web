import { readFileSync } from "fs";
import { resolve } from "path";
import mongoose from "mongoose";

function loadEnv() {
  const raw = readFileSync(resolve(".env.local"), "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (!m) continue;
    process.env[m[1].trim()] = m[2].trim();
  }
}

loadEnv();
await mongoose.connect(process.env.MONGODB_URI);
const db = mongoose.connection.db;

const cols = await db.listCollections().toArray();
const names = cols.map((c) => c.name);
console.log("Relevant collections:", names.filter((n) => /task|tracker|staff/i.test(n)).join(", "));

const staffCol =
  names.find((n) => n.toLowerCase() === "staffusers") ||
  names.find((n) => /staff/i.test(n));
const taskCol =
  names.find((n) => n.toLowerCase() === "ostasks") ||
  names.find((n) => /ostask/i.test(n));
const trackerCol =
  names.find((n) => /editcotrackerrow/i.test(n)) ||
  names.find((n) => /trackerrow/i.test(n));

const staff = staffCol
  ? await db.collection(staffCol).find({}).project({ name: 1, email: 1 }).toArray()
  : [];
const staffMap = Object.fromEntries(staff.map((s) => [String(s._id), s.name || s.email]));

const tasks = taskCol
  ? await db
      .collection(taskCol)
      .find({ $or: [{ recordStatus: "active" }, { recordStatus: { $exists: false } }] })
      .project({ title: 1, status: 1, assignedToId: 1, dueDate: 1, recordStatus: 1 })
      .sort({ updatedAt: -1 })
      .limit(200)
      .toArray()
  : [];

console.log(`\n=== OS TASKS (${tasks.length}) from ${taskCol || "none"} ===`);
if (tasks.length === 0) console.log("(none)");
for (const t of tasks) {
  const who = t.assignedToId ? staffMap[String(t.assignedToId)] || String(t.assignedToId) : "—";
  const due = t.dueDate ? new Date(t.dueDate).toISOString().slice(0, 10) : "—";
  console.log(`- [${t.status || "?"}] ${t.title || "(no title)"} | assignee: ${who} | due: ${due}`);
}

const tracker = trackerCol
  ? await db
      .collection(trackerCol)
      .find({})
      .project({ projectName: 1, taskName: 1, status: 1, poc: 1, dependency: 1, date: 1 })
      .sort({ date: -1 })
      .limit(200)
      .toArray()
  : [];

console.log(`\n=== MASTER TRACKER (${tracker.length}) from ${trackerCol || "none"} ===`);
if (tracker.length === 0) console.log("(none)");
for (const r of tracker) {
  const dep = (r.dependency || []).join(", ") || "—";
  const d = r.date ? new Date(r.date).toISOString().slice(0, 10) : "—";
  console.log(
    `- [${r.status || "?"}] ${r.projectName || ""} / ${r.taskName || ""} | POC: ${r.poc || "—"} | dep: ${dep} | date: ${d}`
  );
}

await mongoose.disconnect();
