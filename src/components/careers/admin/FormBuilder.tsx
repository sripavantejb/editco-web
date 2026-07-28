"use client";

import { FORM_FIELD_TYPE_LABELS, FORM_FIELD_TYPES, JOB_FILE_MAX_MB } from "@/lib/constants";
import {
  fieldNeedsOptions,
  newFieldId,
  type FormFieldDef,
} from "@/lib/jobs";
import { Button } from "@/components/referral/ui/button";
import { Input } from "@/components/referral/ui/input";
import { Label } from "@/components/referral/ui/label";
import { Card } from "@/components/referral/ui/card";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";

type Props = {
  fields: FormFieldDef[];
  onChange: (fields: FormFieldDef[]) => void;
};

function blankField(type: FormFieldDef["type"] = "short_text"): FormFieldDef {
  const base: FormFieldDef = {
    id: newFieldId(),
    type,
    label: FORM_FIELD_TYPE_LABELS[type],
    required: false,
  };
  if (fieldNeedsOptions(type)) {
    base.options = [
      { value: "option_1", label: "Option 1" },
      { value: "option_2", label: "Option 2" },
    ];
  }
  if (type === "file") {
    base.accept =
      ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    base.maxSizeMb = JOB_FILE_MAX_MB;
    base.helpText = `PDF or Word, max ${JOB_FILE_MAX_MB}MB`;
  }
  return base;
}

export function FormBuilder({ fields, onChange }: Props) {
  const update = (index: number, patch: Partial<FormFieldDef>) => {
    const next = fields.map((f, i) => {
      if (i !== index) return f;
      const merged = { ...f, ...patch };
      if (patch.type && patch.type !== f.type) {
        if (fieldNeedsOptions(patch.type) && !merged.options?.length) {
          merged.options = [
            { value: "option_1", label: "Option 1" },
            { value: "option_2", label: "Option 2" },
          ];
        }
        if (patch.type === "file") {
          merged.maxSizeMb = merged.maxSizeMb || JOB_FILE_MAX_MB;
          merged.accept =
            merged.accept ||
            ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        }
      }
      return merged;
    });
    onChange(next);
  };

  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= fields.length) return;
    const next = [...fields];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    onChange(next);
  };

  const remove = (index: number) => {
    onChange(fields.filter((_, i) => i !== index));
  };

  const add = (type?: FormFieldDef["type"]) => {
    onChange([...fields, blankField(type)]);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-archivo text-[10px] uppercase tracking-[0.2em] text-gaude-orange">
            Application form
          </p>
          <h3 className="mt-1 font-archivo text-lg uppercase tracking-tight text-[var(--dash-text)]">
            Form builder
          </h3>
          <p className="mt-1 text-sm text-[var(--dash-muted)]">
            Add fields applicants will fill on the careers page.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={() => add()}>
            <Plus className="h-3.5 w-3.5" />
            Add field
          </Button>
        </div>
      </div>

      {fields.length === 0 ? (
        <Card className="border-dashed text-center text-sm text-[var(--dash-muted)]">
          No fields yet. Add a field to start building the application form.
        </Card>
      ) : (
        <ul className="space-y-3">
          {fields.map((field, index) => (
            <li key={field.id}>
              <Card className="space-y-3 p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <span className="font-inter text-xs text-[var(--dash-faint)]">
                    Field {index + 1}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Move up"
                      onClick={() => move(index, -1)}
                      disabled={index === 0}
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Move down"
                      onClick={() => move(index, 1)}
                      disabled={index === fields.length - 1}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Remove field"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </Button>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor={`label-${field.id}`}>Label</Label>
                    <Input
                      id={`label-${field.id}`}
                      value={field.label}
                      onChange={(e) => update(index, { label: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor={`type-${field.id}`}>Type</Label>
                    <select
                      id={`type-${field.id}`}
                      value={field.type}
                      onChange={(e) =>
                        update(index, {
                          type: e.target.value as FormFieldDef["type"],
                        })
                      }
                      className="flex h-11 w-full rounded-xl border border-[var(--dash-border)] bg-[var(--dash-input)] px-3 text-sm text-[var(--dash-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gaude-orange"
                    >
                      {FORM_FIELD_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {FORM_FIELD_TYPE_LABELS[t]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {field.type !== "checkbox" && field.type !== "file" && (
                  <div className="space-y-1.5">
                    <Label htmlFor={`ph-${field.id}`}>Placeholder</Label>
                    <Input
                      id={`ph-${field.id}`}
                      value={field.placeholder || ""}
                      onChange={(e) =>
                        update(index, { placeholder: e.target.value })
                      }
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor={`help-${field.id}`}>Help text</Label>
                  <Input
                    id={`help-${field.id}`}
                    value={field.helpText || ""}
                    onChange={(e) =>
                      update(index, { helpText: e.target.value })
                    }
                  />
                </div>

                {fieldNeedsOptions(field.type) && (
                  <div className="space-y-2 rounded-xl border border-[var(--dash-border)] bg-[var(--dash-bg)]/40 p-3">
                    <Label>Options</Label>
                    {(field.options || []).map((opt, oi) => (
                      <div key={oi} className="flex gap-2">
                        <Input
                          value={opt.label}
                          placeholder="Label"
                          onChange={(e) => {
                            const options = [...(field.options || [])];
                            const label = e.target.value;
                            const value = label
                              .toLowerCase()
                              .replace(/[^a-z0-9]+/g, "_")
                              .replace(/^_|_$/g, "");
                            options[oi] = { label, value: value || `opt_${oi}` };
                            update(index, { options });
                          }}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label="Remove option"
                          onClick={() => {
                            const options = (field.options || []).filter(
                              (_, i) => i !== oi
                            );
                            update(index, { options });
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const n = (field.options || []).length + 1;
                        update(index, {
                          options: [
                            ...(field.options || []),
                            { value: `option_${n}`, label: `Option ${n}` },
                          ],
                        });
                      }}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Option
                    </Button>
                  </div>
                )}

                {field.type === "file" && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor={`max-${field.id}`}>Max size (MB)</Label>
                      <Input
                        id={`max-${field.id}`}
                        type="number"
                        min={1}
                        max={10}
                        value={field.maxSizeMb || JOB_FILE_MAX_MB}
                        onChange={(e) =>
                          update(index, {
                            maxSizeMb: Number(e.target.value) || JOB_FILE_MAX_MB,
                          })
                        }
                      />
                    </div>
                  </div>
                )}

                <label className="flex min-h-11 items-center gap-2 text-sm text-[var(--dash-muted)]">
                  <input
                    type="checkbox"
                    checked={field.required}
                    onChange={(e) =>
                      update(index, { required: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-[var(--dash-border)]"
                  />
                  Required
                </label>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <div className="sticky bottom-3 z-10 rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-bg)]/95 p-3 backdrop-blur-md sm:static sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
        <div className="flex flex-wrap gap-2">
          {(
            [
              "short_text",
              "long_text",
              "email",
              "select",
              "file",
            ] as const
          ).map((t) => (
            <Button
              key={t}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => add(t)}
            >
              <Plus className="h-3 w-3" />
              {FORM_FIELD_TYPE_LABELS[t]}
            </Button>
          ))}
          <Button type="button" variant="secondary" size="sm" onClick={() => add()}>
            <Plus className="h-3 w-3" />
            More types…
          </Button>
        </div>
      </div>
    </div>
  );
}
