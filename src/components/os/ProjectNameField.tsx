"use client";

import { useState } from "react";
import { OsSelect } from "@/components/os/OsSelect";
import { osInputClass } from "@/components/os/ui";

const OTHER = "__other__";

/** Existing projects as a dropdown, with "Other" revealing a free-text name. */
export function ProjectNameField({
  projects,
  name,
  defaultValue = "",
  onChange,
  inputClassName,
}: {
  projects: string[];
  name?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  inputClassName?: string;
}) {
  const known = !defaultValue || projects.includes(defaultValue);
  const [choice, setChoice] = useState(known ? defaultValue : OTHER);
  const [custom, setCustom] = useState(known ? "" : defaultValue);
  const value = choice === OTHER ? custom : choice;

  return (
    <div className="grid gap-2">
      {name ? <input type="hidden" name={name} value={value} /> : null}
      <OsSelect
        value={choice}
        placeholder="Select project"
        options={[
          ...projects.map((p) => ({ value: p, label: p })),
          { value: OTHER, label: "Other (type a new name)" },
        ]}
        onChange={(v) => {
          setChoice(v);
          onChange?.(v === OTHER ? custom : v);
        }}
      />
      {choice === OTHER ? (
        <input
          autoFocus
          required={Boolean(name)}
          value={custom}
          placeholder="New project name"
          onChange={(e) => {
            setCustom(e.target.value);
            onChange?.(e.target.value);
          }}
          className={inputClassName || osInputClass()}
        />
      ) : null}
    </div>
  );
}
