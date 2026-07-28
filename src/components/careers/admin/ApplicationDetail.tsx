"use client";

import { useActionState, useState, useTransition } from "react";
import Link from "next/link";
import {
  APPLICATION_STATUSES,
  APPLICATION_STATUS_LABELS,
  FORM_FIELD_TYPE_LABELS,
  type ApplicationStatus,
  type FormFieldType,
} from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";
import { isFileAnswer, type AnswerValue } from "@/lib/jobs";
import {
  deleteApplication,
  getApplicationFilePayload,
  updateApplicationNotes,
  updateApplicationStatus,
} from "@/actions/applications";
import type { ActionState } from "@/actions/auth";
import { Button } from "@/components/referral/ui/button";
import { Label } from "@/components/referral/ui/label";
import { Textarea } from "@/components/referral/ui/textarea";
import { Card } from "@/components/referral/ui/card";

export type ApplicationDetailData = {
  id: string;
  jobId: string;
  jobTitle: string;
  applicantName: string;
  applicantEmail: string;
  status: ApplicationStatus;
  adminNotes: string;
  createdAt: string;
  answers: {
    fieldId: string;
    label: string;
    type: FormFieldType;
    value: AnswerValue;
  }[];
};

export function ApplicationDetail({ app }: { app: ApplicationDetailData }) {
  const [status, setStatus] = useState(app.status);
  const [pendingStatus, startStatus] = useTransition();
  const [notesState, notesAction, notesPending] = useActionState<
    ActionState,
    FormData
  >(updateApplicationNotes, {});
  const [confirmDelete, setConfirmDelete] = useState(false);

  const onStatusChange = (next: ApplicationStatus) => {
    setStatus(next);
    startStatus(async () => {
      const res = await updateApplicationStatus(app.id, next);
      if (res.error) setStatus(app.status);
    });
  };

  const downloadFile = async (fieldId: string) => {
    const file = await getApplicationFilePayload(app.id, fieldId);
    if (!file) return;
    const a = document.createElement("a");
    a.href = `data:${file.mimeType};base64,${file.dataBase64}`;
    a.download = file.name;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-archivo text-[10px] uppercase tracking-[0.2em] text-gaude-orange">
            Application
          </p>
          <h1 className="mt-1 font-archivo text-2xl uppercase tracking-tighter text-[var(--dash-text)] sm:text-3xl">
            {app.applicantName}
          </h1>
          <p className="mt-1 text-sm text-[var(--dash-muted)]">
            {app.jobTitle} · {formatDateTime(app.createdAt)}
          </p>
          {app.applicantEmail && (
            <a
              href={`mailto:${app.applicantEmail}`}
              className="mt-1 inline-block text-sm text-gaude-orange hover:underline"
            >
              {app.applicantEmail}
            </a>
          )}
        </div>
        <Link
          href="/admin/applications"
          className="inline-flex h-9 items-center justify-center rounded-full border border-[var(--dash-border)] px-4 font-archivo text-xs uppercase tracking-[0.08em] text-[var(--dash-text)] transition hover:bg-[var(--dash-hover)]"
        >
          All applications
        </Link>
      </div>

      <Card className="space-y-3">
        <Label htmlFor="status">Status</Label>
        <select
          id="status"
          value={status}
          disabled={pendingStatus}
          onChange={(e) =>
            onStatusChange(e.target.value as ApplicationStatus)
          }
          className="flex h-11 w-full max-w-xs rounded-xl border border-[var(--dash-border)] bg-[var(--dash-input)] px-3 text-sm text-[var(--dash-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gaude-orange"
        >
          {APPLICATION_STATUSES.map((s) => (
            <option key={s} value={s}>
              {APPLICATION_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </Card>

      <div className="space-y-3">
        <h2 className="font-archivo text-sm uppercase tracking-wide text-[var(--dash-text)]">
          Answers
        </h2>
        {app.answers.map((answer) => (
          <Card key={answer.fieldId} className="space-y-1.5 p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-sm font-medium text-[var(--dash-text)]">
                {answer.label}
              </h3>
              <span className="text-[10px] uppercase tracking-wider text-[var(--dash-faint)]">
                {FORM_FIELD_TYPE_LABELS[answer.type]}
              </span>
            </div>
            <AnswerDisplay
              answer={answer}
              onDownloadFile={() => downloadFile(answer.fieldId)}
            />
          </Card>
        ))}
      </div>

      <Card>
        <form action={notesAction} className="space-y-3">
          <input type="hidden" name="applicationId" value={app.id} />
          <Label htmlFor="adminNotes">Admin notes</Label>
          <Textarea
            id="adminNotes"
            name="adminNotes"
            defaultValue={app.adminNotes}
            rows={4}
          />
          {notesState.error && (
            <p className="text-sm text-red-300">{notesState.error}</p>
          )}
          {notesState.success && (
            <p className="text-sm text-[var(--dash-accent)]">
              {notesState.success}
            </p>
          )}
          <Button type="submit" size="sm" disabled={notesPending}>
            {notesPending ? "Saving…" : "Save notes"}
          </Button>
        </form>
      </Card>

      <div>
        {!confirmDelete ? (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => setConfirmDelete(true)}
          >
            Delete application
          </Button>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-[var(--dash-muted)]">
              Permanently delete this application?
            </span>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => deleteApplication(app.id)}
            >
              Confirm
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setConfirmDelete(false)}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function AnswerDisplay({
  answer,
  onDownloadFile,
}: {
  answer: ApplicationDetailData["answers"][number];
  onDownloadFile: () => void;
}) {
  const { value, type } = answer;

  if (isFileAnswer(value) || (type === "file" && value && typeof value === "object")) {
    const meta = value as { name?: string; size?: number };
    return (
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <span className="text-sm text-[var(--dash-muted)]">
          {meta.name || "Attachment"}
          {meta.size ? ` (${Math.round(meta.size / 1024)} KB)` : ""}
        </span>
        <Button type="button" variant="outline" size="sm" onClick={onDownloadFile}>
          Download
        </Button>
      </div>
    );
  }

  if (type === "checkbox") {
    return (
      <p className="text-sm text-[var(--dash-text)]">
        {value === true ? "Yes" : "No"}
      </p>
    );
  }

  if (Array.isArray(value)) {
    return (
      <p className="text-sm text-[var(--dash-text)]">{value.join(", ") || "—"}</p>
    );
  }

  return (
    <p className="whitespace-pre-wrap text-sm text-[var(--dash-text)]">
      {String(value || "—")}
    </p>
  );
}
