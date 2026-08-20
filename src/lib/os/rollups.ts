import { Invoice } from "@/models/os/Invoice";
import { Payment } from "@/models/os/Payment";
import { Project } from "@/models/os/Project";
import { displayInvoiceStatus, outstandingOf } from "@/lib/os/money";
import { ACTIVE_PROJECT_STATUSES, normalizeProjectStatus, type InvoiceStatus } from "@/lib/os/constants";

export type MoneyRollup = {
  contract: number;
  invoiced: number;
  received: number;
  outstanding: number;
};

function empty(): MoneyRollup {
  return { contract: 0, invoiced: 0, received: 0, outstanding: 0 };
}

export async function projectRollup(projectId: string): Promise<MoneyRollup> {
  const project = await Project.findById(projectId).lean();
  if (!project) return empty();
  const invoices = await Invoice.find({
    projectId,
    recordStatus: "active",
    status: { $ne: "cancelled" },
  }).lean();
  const invoiced = invoices
    .filter((i) => i.status !== "draft")
    .reduce((s, i) => s + (i.total || 0), 0);
  const received = invoices.reduce((s, i) => s + (i.amountPaid || 0), 0);
  return {
    contract: project.budget || 0,
    invoiced,
    received,
    outstanding: outstandingOf(invoiced, received),
  };
}

export async function conversionRollup(conversionUuid: string) {
  const projects = await Project.find({
    conversionUuid,
    recordStatus: "active",
  }).lean();
  const invoices = await Invoice.find({
    conversionUuid,
    recordStatus: "active",
    status: { $ne: "cancelled" },
  }).lean();
  const issued = invoices.filter((i) => i.status !== "draft");
  const invoiced = issued.reduce((s, i) => s + (i.total || 0), 0);
  const received = invoices.reduce((s, i) => s + (i.amountPaid || 0), 0);
  const contract = projects.reduce((s, p) => s + (p.budget || 0), 0);
  const activeProjects = projects.filter((p) =>
    ACTIVE_PROJECT_STATUSES.includes(normalizeProjectStatus(p.status))
  ).length;
  const completedProjects = projects.filter(
    (p) => normalizeProjectStatus(p.status) === "completed"
  ).length;
  return {
    contract,
    invoiced,
    received,
    outstanding: outstandingOf(invoiced, received),
    activeProjects,
    completedProjects,
    projectCount: projects.length,
  };
}

export function withDisplayStatus<
  T extends {
    status: InvoiceStatus;
    dueDate?: Date | string | null;
    amountPaid?: number;
    total?: number;
  },
>(invoice: T) {
  return {
    ...invoice,
    displayStatus: displayInvoiceStatus({
      status: invoice.status,
      dueDate: invoice.dueDate,
      amountPaid: invoice.amountPaid || 0,
      total: invoice.total || 0,
    }),
  };
}

export async function vendorPayments(conversionUuid: string) {
  return Payment.find({ conversionUuid, recordStatus: "active" })
    .sort({ paidAt: -1 })
    .lean();
}
