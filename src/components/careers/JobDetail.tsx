"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  EMPLOYMENT_TYPE_LABELS,
  type EmploymentType,
} from "@/lib/constants";
import type { FormFieldDef } from "@/lib/jobs";
import { ApplicationForm } from "@/components/careers/ApplicationForm";
import { ArrowLeft, MapPin } from "lucide-react";

export type JobDetailData = {
  id: string;
  title: string;
  department: string;
  location: string;
  employmentType: EmploymentType;
  summary: string;
  description: string;
  requirements: string;
  benefits: string;
  formFields: FormFieldDef[];
};

const ease = [0.16, 1, 0.3, 1] as const;

function Block({ title, body }: { title: string; body: string }) {
  if (!body?.trim()) return null;
  return (
    <div>
      <h2 className="font-archivo text-sm uppercase tracking-[0.14em] text-[var(--careers-accent)]">
        {title}
      </h2>
      <p className="mt-3 whitespace-pre-wrap font-inter text-sm leading-relaxed text-white/70 sm:text-base">
        {body}
      </p>
    </div>
  );
}

export function JobDetail({ job }: { job: JobDetailData }) {
  return (
    <main className="careers-theme min-h-svh bg-[#050505] px-4 pb-20 pt-28 sm:px-6 lg:px-10">
      <div className="mx-auto grid max-w-[1100px] gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14">
        <div>
          <Link
            href="/careers"
            className="inline-flex min-h-11 items-center gap-2 text-sm text-white/55 transition hover:text-[var(--careers-accent)]"
          >
            <ArrowLeft className="h-4 w-4" />
            All roles
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            className="mt-6"
          >
            <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.14em] text-[var(--careers-muted)]">
              {job.department ? <span>{job.department}</span> : null}
              {job.department ? <span aria-hidden>·</span> : null}
              <span>{EMPLOYMENT_TYPE_LABELS[job.employmentType]}</span>
            </div>
            <h1 className="mt-3 font-archivo text-[clamp(2rem,8vw,3.5rem)] uppercase leading-[0.95] tracking-tight text-white">
              {job.title}
            </h1>
            <p className="mt-4 inline-flex items-center gap-1.5 text-sm text-white/55">
              <MapPin className="h-3.5 w-3.5" />
              {job.location}
            </p>
            {job.summary ? (
              <p className="mt-5 max-w-xl font-inter text-base leading-relaxed text-white/65">
                {job.summary}
              </p>
            ) : null}
          </motion.div>

          <div className="mt-10 space-y-8 border-t border-white/10 pt-10">
            <Block title="About the role" body={job.description} />
            <Block title="Requirements" body={job.requirements} />
            <Block title="Benefits" body={job.benefits} />
          </div>
        </div>

        <div className="lg:sticky lg:top-28 lg:self-start">
          <ApplicationForm jobId={job.id} fields={job.formFields} />
        </div>
      </div>
    </main>
  );
}
