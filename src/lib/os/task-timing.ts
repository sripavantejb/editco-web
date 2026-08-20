export function formatDurationMs(ms: number): string {
  if (ms < 0) ms = 0;
  const totalMinutes = Math.round(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
}

export function plannedDurationMs(
  plannedStart?: Date | string | null,
  plannedEnd?: Date | string | null
): number | null {
  if (!plannedStart || !plannedEnd) return null;
  const a = new Date(plannedStart).getTime();
  const b = new Date(plannedEnd).getTime();
  if (Number.isNaN(a) || Number.isNaN(b) || b <= a) return null;
  return b - a;
}

export function exceededPlanned(
  actualMs: number,
  plannedStart?: Date | string | null,
  plannedEnd?: Date | string | null
): boolean {
  const planned = plannedDurationMs(plannedStart, plannedEnd);
  if (planned == null) return false;
  return actualMs > planned;
}

export function sumSessionDurations(
  sessions: { startedAt: Date | string; endedAt?: Date | string | null; durationMs?: number }[],
  now = Date.now()
): number {
  let total = 0;
  for (const s of sessions) {
    if (s.durationMs && s.endedAt) {
      total += s.durationMs;
      continue;
    }
    const start = new Date(s.startedAt).getTime();
    const end = s.endedAt ? new Date(s.endedAt).getTime() : now;
    if (!Number.isNaN(start) && end > start) total += end - start;
  }
  return total;
}
