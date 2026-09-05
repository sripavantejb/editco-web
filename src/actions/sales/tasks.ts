"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/db";
import { SalesTask } from "@/models/sales/SalesTask";
import { requireSalesAction, requireSalesAdminAction } from "@/lib/sales/guard";
import { logSalesActivity, notifySalesEmployee } from "@/lib/sales/activity";
import { SALES_LEAD_PRIORITIES } from "@/lib/sales/constants";
import type { ActionState } from "@/actions/auth";

const createSchema = z.object({
  title: z.string().min(2, "Title is required"),
  description: z.string().optional(),
  priority: z.enum(SALES_LEAD_PRIORITIES).optional(),
  dueDate: z.string().optional(),
});

export async function createSalesTask(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const gate = await requireSalesAction("tasks.management");
  if (!gate.ok) return { error: gate.error };

  const parsed = createSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    priority: formData.get("priority") || undefined,
    dueDate: formData.get("dueDate") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message || "Invalid input" };

  await connectDB();
  await SalesTask.create({
    title: parsed.data.title,
    description: parsed.data.description || "",
    ownerEmployeeId: gate.employee.employeeId,
    priority: parsed.data.priority || "medium",
    dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : undefined,
    status: "todo",
    createdBy: gate.employee.email,
  });

  await logSalesActivity({
    type: "task_completed",
    title: `Task created: ${parsed.data.title}`,
    actorEmployeeId: gate.employee.employeeId,
    actorName: gate.employee.name,
  });

  revalidatePath("/sales/employee/tasks");
  revalidatePath("/sales/employee/calendar");
  return { success: "Task added." };
}

const assignSchema = z.object({
  employeeId: z.string().min(1, "Choose an employee"),
  title: z.string().min(2, "Title is required"),
  description: z.string().optional(),
  priority: z.enum(SALES_LEAD_PRIORITIES).optional(),
  dueDate: z.string().optional(),
});

/** Sales Admin assigns a task to a specific employee — it then shows up on that employee's own Task Management page. */
export async function assignSalesTask(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const gate = await requireSalesAdminAction();
  if (!gate.ok) return { error: gate.error };

  const parsed = assignSchema.safeParse({
    employeeId: formData.get("employeeId"),
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    priority: formData.get("priority") || undefined,
    dueDate: formData.get("dueDate") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message || "Invalid input" };

  await connectDB();
  const task = await SalesTask.create({
    title: parsed.data.title,
    description: parsed.data.description || "",
    ownerEmployeeId: parsed.data.employeeId,
    priority: parsed.data.priority || "medium",
    dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : undefined,
    status: "todo",
    createdBy: gate.employee.email,
  });

  await notifySalesEmployee({
    employeeId: parsed.data.employeeId,
    type: "task_assigned",
    title: "New task assigned",
    body: parsed.data.title,
    href: "/sales/employee/tasks",
  });

  await logSalesActivity({
    type: "task_completed",
    title: `Task "${parsed.data.title}" assigned by ${gate.employee.name}`,
    actorEmployeeId: gate.employee.employeeId,
    actorName: gate.employee.name,
    metadata: { taskId: task._id.toString(), assignedTo: parsed.data.employeeId },
  });

  revalidatePath("/sales/admin/tasks");
  revalidatePath("/sales/employee/tasks");
  return { success: "Task assigned." };
}

const statusSchema = z.object({
  taskId: z.string().min(1),
  status: z.enum(["todo", "in_progress", "completed", "overdue"]),
});

export async function updateSalesTaskStatus(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const gate = await requireSalesAction("tasks.management");
  if (!gate.ok) return { error: gate.error };

  const parsed = statusSchema.safeParse({
    taskId: formData.get("taskId"),
    status: formData.get("status"),
  });
  if (!parsed.success) return { error: "Invalid input" };

  await connectDB();
  const task = await SalesTask.findById(parsed.data.taskId);
  if (!task) return { error: "Task not found" };

  task.status = parsed.data.status;
  await task.save();

  if (parsed.data.status === "completed") {
    await logSalesActivity({
      type: "task_completed",
      title: `Task completed: ${task.title}`,
      actorEmployeeId: gate.employee.employeeId,
      actorName: gate.employee.name,
    });
  }

  revalidatePath("/sales/employee/tasks");
  revalidatePath("/sales/employee/calendar");
  return { success: "Task updated." };
}
