export const dynamic = "force-dynamic";

import Link from "next/link";
import { requireOsPage } from "@/lib/os/page";
import { OsPage } from "@/components/os/ui";

type Step = {
  title: string;
  body: string;
};

type JourneySection = {
  id: string;
  label: string;
  summary: string;
  where: string;
  steps: Step[];
  tip?: string;
};

const JOURNEY: JourneySection[] = [
  {
    id: "setup",
    label: "1. First-time setup",
    summary:
      "Do this once before day-to-day work. It makes every later screen fill correctly.",
    where: "Admin → Users & roles, Services",
    steps: [
      {
        title: "Add staff users",
        body: "Create accounts for sales, project managers, team members, and finance. Pick the right role so each person only sees what they need.",
      },
      {
        title: "Add services",
        body: "List the services you sell (for example website, AI agent, branding). These appear when you convert a lead and create projects.",
      },
    ],
    tip: "Without services and users, conversion and assignment screens will feel empty.",
  },
  {
    id: "leads",
    label: "2. Capture leads",
    summary:
      "A lead is a person or company you want to sell to. Everything sales starts here.",
    where: "Sales → Leads, Lead Lists, Import",
    steps: [
      {
        title: "Add one lead",
        body: "Go to Leads → New lead. Enter name, company, phone/email, source, and what they need.",
      },
      {
        title: "Or import many leads",
        body: "Use Import with the CSV template. Good for seeding demos or loading a campaign list in one go.",
      },
      {
        title: "Group with lead lists",
        body: "Create a Lead List (for example “March cold outreach”) and attach leads to it so the team works from one shared pile.",
      },
      {
        title: "Use pitches when helpful",
        body: "On a lead, add or copy pitch messages so outreach stays consistent across the team.",
      },
    ],
  },
  {
    id: "pipeline",
    label: "3. Move leads through the pipeline",
    summary:
      "Stages show how close someone is to becoming a client. Move them as the conversation progresses.",
    where: "Sales → Pipeline, Calling, Follow-ups, Proposals",
    steps: [
      {
        title: "Watch the board",
        body: "Open Pipeline. Columns go: New → Contacted → Qualified → Proposal → Negotiation → Converted.",
      },
      {
        title: "Update the stage",
        body: "On the lead page (or board), move the stage when you call, qualify, send a proposal, or negotiate.",
      },
      {
        title: "Log calls",
        body: "Use Calling to record outreach. This keeps a history of who spoke to the lead and what was said.",
      },
      {
        title: "Set follow-ups",
        body: "Add a follow-up date so nobody forgets to call back. Check Follow-ups daily.",
      },
      {
        title: "Attach proposals",
        body: "When you send pricing or a scope, log it under Proposals so the deal trail is clear.",
      },
      {
        title: "Optional: Projects Vault",
        body: "Vault stores past/demo project links and login details you may pitch to leads. It is separate from live client delivery projects.",
      },
    ],
    tip: "Lost or On hold are fine outcomes — mark them so the board stays honest.",
  },
  {
    id: "convert",
    label: "4. Convert a lead into a client",
    summary:
      "Conversion is the big handoff. One permanent ID is created and becomes the backbone for client, projects, and money.",
    where: "Lead detail → Convert, then Clients / Conversions",
    steps: [
      {
        title: "Open Convert on the lead",
        body: "When the deal is won, open the lead and start Convert. Confirm company details, value, and services.",
      },
      {
        title: "What the system creates",
        body: "It mints a conversion UUID and public code, creates (or links) a client record, and marks the lead as Converted.",
      },
      {
        title: "Find it later",
        body: "Use Conversions for the event list, Clients for the company page, or Search with the public code (for example EC-2026-…).",
      },
    ],
    tip: "Treat conversion as a one-time event — do not “re-convert” the same deal. Work from the client and projects after this.",
  },
  {
    id: "delivery",
    label: "5. Deliver the work (projects)",
    summary:
      "After conversion, delivery lives on Projects — tasks, meetings, documents, and updates for the team.",
    where: "Delivery → Projects, Tasks, Meetings, Documents",
    steps: [
      {
        title: "Create or open the project",
        body: "From Projects (or during conversion if you started one), set status, owner, and members.",
      },
      {
        title: "Break work into tasks",
        body: "Add tasks, assign people, set due dates. Team members work from Tasks and the dashboard “my tasks” list.",
      },
      {
        title: "Use milestones",
        body: "Milestones (Discovery, Design, Launch, and so on) mark big checkpoints on the project.",
      },
      {
        title: "Schedule meetings",
        body: "Book client or internal meetings under Meetings. Clients can see relevant ones in their portal.",
      },
      {
        title: "Store documents",
        body: "Upload briefs, contracts, and deliverable links in Documents so the team and client share one place.",
      },
      {
        title: "Post project updates",
        body: "Share progress notes on the project so everyone (and the client, when shared) knows status without chasing chats.",
      },
    ],
  },
  {
    id: "finance",
    label: "6. Invoice and collect payment",
    summary:
      "Finance sits on the same client/project spine. Draft → issue → share → record payments until the balance is clear.",
    where: "Finance → Invoices, Payments, Outstanding",
    steps: [
      {
        title: "Create an invoice",
        body: "New invoice, pick the client/project, add line items, save as draft while you check amounts.",
      },
      {
        title: "Issue and share",
        body: "Issue the invoice, then share the link or portal view with the client so they can see what they owe.",
      },
      {
        title: "Record payments",
        body: "When money comes in, log it under Payments. Status moves to partially paid or paid automatically from balances.",
      },
      {
        title: "Chase outstanding",
        body: "Outstanding lists unpaid or overdue amounts so finance can follow up quickly.",
      },
    ],
  },
  {
    id: "portal",
    label: "7. Client portal",
    summary:
      "Clients get a private link to see their projects, invoices, payments, meetings, and documents — without admin access.",
    where: "Client record → portal link / Copy portal URL",
    steps: [
      {
        title: "Share the portal URL",
        body: "From the client, copy the portal link and send it securely. That UUID/token is their access key.",
      },
      {
        title: "What the client sees",
        body: "Their projects, invoice list and detail, payment history, meetings, and documents you attached for them.",
      },
    ],
    tip: "Only share portal links with the right contact. Treat them like a password.",
  },
  {
    id: "ops",
    label: "8. Stay on top of operations",
    summary:
      "Use these screens every day so nothing slips — they do not replace the journey above; they watch it.",
    where: "Overview, Operations",
    steps: [
      {
        title: "Dashboard",
        body: "Start here for today’s tasks, upcoming meetings, open leads, and quick counts.",
      },
      {
        title: "Notifications",
        body: "Alerts for assignments and important changes on your account.",
      },
      {
        title: "Search",
        body: "Find a conversion code, company, or invoice number in one box.",
      },
      {
        title: "Activity",
        body: "Timeline of who did what — useful when seeding data or auditing a deal.",
      },
      {
        title: "Analytics",
        body: "Higher-level view of pipeline and delivery health once you have real data.",
      },
    ],
  },
];

const BIG_PICTURE = [
  "Lead — someone you are selling to",
  "Convert — win the deal; system creates a permanent conversion ID + client",
  "Project — do the work with tasks, meetings, documents",
  "Invoice & payment — bill and collect",
  "Portal — client checks progress and bills on their own link",
];

export default async function HowItWorksPage() {
  await requireOsPage("dashboard:read");

  return (
    <OsPage
      title="How it works"
      subtitle="Simple walkthrough of Editco OS — from first setup to a paid, delivered client. Use this when seeding data or onboarding someone new."
      backHref="/admin/os"
      backLabel="Back to dashboard"
    >
      <div className="mb-10 rounded-[20px] border border-[var(--dash-border)] bg-[var(--dash-surface)] p-6">
        <p className="font-archivo text-xs uppercase tracking-[0.14em] text-[var(--dash-accent)]">
          Big picture
        </p>
        <ol className="mt-4 space-y-3">
          {BIG_PICTURE.map((line, i) => (
            <li
              key={line}
              className="flex gap-3 font-inter text-sm text-[var(--dash-text)]"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--dash-accent-soft)] font-archivo text-[11px] text-[var(--dash-accent)]">
                {i + 1}
              </span>
              <span>{line}</span>
            </li>
          ))}
        </ol>
        <p className="mt-5 font-inter text-sm text-[var(--dash-muted)]">
          One sentence:{" "}
          <span className="text-[var(--dash-text)]">
            Find a lead → nurture in the pipeline → convert to a client → run
            the project → invoice → get paid → client uses the portal.
          </span>
        </p>
      </div>

      <nav
        aria-label="Jump to section"
        className="mb-10 flex flex-wrap gap-2"
      >
        {JOURNEY.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className="inline-flex min-h-9 items-center rounded-full border border-[var(--dash-border)] px-3 font-inter text-xs text-[var(--dash-muted)] hover:bg-[var(--dash-hover)] hover:text-[var(--dash-text)]"
          >
            {section.label}
          </a>
        ))}
      </nav>

      <div className="space-y-8">
        {JOURNEY.map((section) => (
          <section
            key={section.id}
            id={section.id}
            className="scroll-mt-24 rounded-[20px] border border-[var(--dash-border)] bg-[var(--dash-surface)] p-6 sm:p-7"
          >
            <div className="mb-5 border-b border-[var(--dash-border)] pb-4">
              <h2 className="font-archivo text-lg uppercase tracking-wide text-[var(--dash-text)]">
                {section.label}
              </h2>
              <p className="mt-2 max-w-3xl font-inter text-sm text-[var(--dash-muted)]">
                {section.summary}
              </p>
              <p className="mt-3 font-inter text-xs text-[var(--dash-faint)]">
                Where in the sidebar:{" "}
                <span className="text-[var(--dash-muted)]">{section.where}</span>
              </p>
            </div>

            <ol className="space-y-5">
              {section.steps.map((step, index) => (
                <li key={step.title} className="flex gap-4">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--dash-hover)] font-archivo text-[11px] text-[var(--dash-accent)]">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-inter text-sm font-medium text-[var(--dash-text)]">
                      {step.title}
                    </p>
                    <p className="mt-1 font-inter text-sm leading-relaxed text-[var(--dash-muted)]">
                      {step.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            {section.tip ? (
              <p className="mt-6 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-bg)] px-4 py-3 font-inter text-sm text-[var(--dash-muted)]">
                <span className="font-medium text-[var(--dash-accent)]">Tip: </span>
                {section.tip}
              </p>
            ) : null}
          </section>
        ))}
      </div>

      <div className="mt-10 rounded-[20px] border border-[var(--dash-border)] bg-[var(--dash-surface)] p-6">
        <h2 className="font-archivo text-sm uppercase tracking-[0.12em] text-[var(--dash-text)]">
          Suggested seed order
        </h2>
        <p className="mt-2 font-inter text-sm text-[var(--dash-muted)]">
          If you are filling the system with sample data, do it in this order so
          links between records stay correct:
        </p>
        <ol className="mt-4 list-decimal space-y-2 pl-5 font-inter text-sm text-[var(--dash-text)]">
          <li>Users & roles, then Services</li>
          <li>A few leads (or import a CSV) and a lead list</li>
          <li>Move one lead through pipeline; add a call and a follow-up</li>
          <li>Convert that lead → confirm client appears</li>
          <li>Open the project; add tasks, a meeting, a document</li>
          <li>Create an invoice, issue it, record a payment</li>
          <li>Open the client portal link and check what the client sees</li>
        </ol>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href="/admin/os/leads/new"
            className="inline-flex min-h-11 items-center rounded-full bg-[var(--dash-accent)] px-5 font-archivo text-xs uppercase tracking-[0.08em] text-[var(--dash-on-accent)]"
          >
            Start with a lead
          </Link>
          <Link
            href="/admin/os/settings/services"
            className="inline-flex min-h-11 items-center rounded-full border border-[var(--dash-border)] px-5 font-archivo text-xs uppercase tracking-[0.08em] text-[var(--dash-text)] hover:bg-[var(--dash-hover)]"
          >
            Set up services
          </Link>
        </div>
      </div>
    </OsPage>
  );
}
