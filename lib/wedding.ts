import {
  currentPhase,
  daysBefore,
  type PhaseKey,
  phaseFor,
  phaseKeys,
  phaseStart,
  type TaskTiming,
} from "@/lib/checklist";
import { daysBetween, formatFullDate, formatMonth } from "@/lib/dates";

export function daysUntil(weddingDate: string | null, today: string) {
  return weddingDate ? daysBetween(today, weddingDate) : null;
}

export function weddingDateLabel(
  weddingDate: string | null,
  estimate: boolean,
) {
  if (!weddingDate) return null;
  return estimate
    ? formatMonth(weddingDate.slice(0, 7))
    : formatFullDate(weddingDate);
}

const datedPhases: readonly PhaseKey[] = phaseKeys.filter(
  (key) => key !== "undated",
);

export function phaseStatus(
  tasks: readonly (TaskTiming & { done_at: string | null })[],
  weddingDate: string | null,
  today: string,
) {
  const current = currentPhase(weddingDate, today);
  if (!weddingDate || !current) return null;
  const position = datedPhases.indexOf(current);
  let done = 0;
  let total = 0;
  let behind = 0;
  for (const task of tasks) {
    const phase = phaseFor(daysBefore(task, weddingDate));
    if (phase === current) {
      total++;
      if (task.done_at) done++;
    } else if (
      !task.done_at &&
      phase !== "undated" &&
      datedPhases.indexOf(phase) < position
    ) {
      behind++;
    }
  }
  const next = datedPhases[position + 1] ?? null;
  const days = daysBetween(today, weddingDate);
  return {
    current,
    done,
    total,
    behind,
    next,
    nextIn: next === null ? null : days - (phaseStart(current) ?? 0) + 1,
  };
}

export function ratio(done: number, total: number) {
  return total > 0 ? Math.min(done / total, 1) : null;
}

export function overallProgress(parts: readonly (number | null)[]) {
  const known = parts.filter((part): part is number => part !== null);
  if (known.length === 0) return 0;
  return known.reduce((sum, part) => sum + part, 0) / known.length;
}

export type MilestoneFacts = {
  hasDate: boolean;
  hiredVendors: number;
  listedHouseholds: number;
  savedTheDate: number;
  invitedHouseholds: number;
  tasksDone: number;
  tasksTotal: number;
  confirmedGuests: number;
  expectedGuests: number;
  committed: number;
  paid: number;
};

export const milestoneKeys = [
  "date",
  "firstVendor",
  "guestList",
  "saveTheDate",
  "halfChecklist",
  "invites",
  "halfConfirmed",
  "allPaid",
] as const;

export type MilestoneKey = (typeof milestoneKeys)[number];

export function milestones(facts: MilestoneFacts) {
  const reached: Record<MilestoneKey, boolean> = {
    date: facts.hasDate,
    firstVendor: facts.hiredVendors > 0,
    guestList: facts.listedHouseholds >= 10,
    saveTheDate: facts.savedTheDate > 0,
    halfChecklist:
      facts.tasksTotal > 0 && facts.tasksDone * 2 >= facts.tasksTotal,
    invites: facts.invitedHouseholds > 0,
    halfConfirmed:
      facts.expectedGuests > 0 &&
      facts.confirmedGuests * 2 >= facts.expectedGuests,
    allPaid: facts.committed > 0 && facts.paid >= facts.committed,
  };
  return milestoneKeys.map((key) => ({ key, reached: reached[key] }));
}
