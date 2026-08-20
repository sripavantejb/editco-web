"use client";

import { OsActionForm } from "@/components/os/OsActionForm";
import { Field, osInputClass, osTextareaClass } from "@/components/os/ui";
import { updateVaultProjectMessages } from "@/actions/os/vault-projects";
import {
  VAULT_MESSAGE_TYPES,
  VAULT_MESSAGE_TYPE_LABELS,
  type VaultMessageType,
} from "@/lib/os/constants";

export function VaultMessagesForm({
  projectId,
  messages,
}: {
  projectId: string;
  messages: Partial<
    Record<VaultMessageType, { subject?: string; body?: string }>
  >;
}) {
  return (
    <OsActionForm
      action={updateVaultProjectMessages}
      submitLabel="Save messages"
      className="max-w-3xl space-y-4"
    >
      <input type="hidden" name="id" value={projectId} />
      {VAULT_MESSAGE_TYPES.map((type) => (
        <div key={type} className="space-y-2 rounded-xl border border-[var(--dash-border)] p-4">
          <p className="font-archivo text-xs uppercase tracking-[0.08em] text-[var(--dash-muted)]">
            {VAULT_MESSAGE_TYPE_LABELS[type]}
          </p>
          {type === "email" ? (
            <Field label="Subject">
              <input
                name="msg_email_subject"
                defaultValue={messages.email?.subject || ""}
                className={osInputClass()}
              />
            </Field>
          ) : null}
          <Field label="Body">
            <textarea
              name={`msg_${type}`}
              defaultValue={messages[type]?.body || ""}
              className={osTextareaClass()}
              rows={4}
              placeholder="Use {{name}}, {{company}}, {{project_name}}, {{sender_name}}, {{phone}}, {{website}}"
            />
          </Field>
        </div>
      ))}
    </OsActionForm>
  );
}
