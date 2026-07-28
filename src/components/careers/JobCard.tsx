"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  EMPLOYMENT_TYPE_LABELS,
  type EmploymentType,
} from "@/lib/constants";
import { ArrowRight, MapPin } from "lucide-react";

export type PublicJobCard = {
  id: string;
  slug: string;
  title: string;
  department: string;
  location: string;
  employmentType: EmploymentType;
  summary: string;
};

const ease = [0.16, 1, 0.3, 1] as const;

export function JobCard({ job, index = 0 }: { job: PublicJobCard; index?: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, delay: index * 0.06, ease }}
    >
      <Link
        href={`/careers/${job.slug}`}
        className="group flex flex-col gap-4 rounded-[24px] border-4 border-gaude-black bg-white/[0.04] p-5 shadow-[8px_8px_0_0_#0a0a0a] transition hover:-translate-y-0.5 hover:border-[var(--careers-accent)] hover:shadow-[8px_8px_0_0_var(--careers-accent)] sm:p-6 md:flex-row md:items-center md:justify-between"
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-[var(--careers-muted)]">
            {job.department ? <span>{job.department}</span> : null}
            {job.department ? <span aria-hidden>·</span> : null}
            <span>{EMPLOYMENT_TYPE_LABELS[job.employmentType]}</span>
          </div>
          <h2 className="mt-2 font-archivo text-xl uppercase tracking-tight text-[var(--careers-text)] sm:text-2xl">
            {job.title}
          </h2>
          {job.summary ? (
            <p className="mt-2 max-w-2xl font-inter text-sm leading-relaxed text-[var(--careers-muted)]">
              {job.summary}
            </p>
          ) : null}
          <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-[var(--careers-faint)]">
            <MapPin className="h-3.5 w-3.5" />
            {job.location}
          </p>
        </div>
        <span className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 self-start rounded-full bg-[var(--careers-accent)] px-5 font-archivo text-xs uppercase tracking-[0.1em] text-[var(--careers-on-accent)] transition group-hover:bg-[var(--careers-accent-hover)] md:self-center">
          View role
          <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </Link>
    </motion.article>
  );
}
