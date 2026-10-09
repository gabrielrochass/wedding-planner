import { currentPhase, type PhaseKey, phaseKeys } from "@/lib/checklist";
import { daysBetween } from "@/lib/dates";

export function daysUntil(weddingDate: string | null, today: string) {
  return weddingDate ? daysBetween(today, weddingDate) : null;
}

export const journeyPhases = phaseKeys.filter(
  (key): key is Exclude<PhaseKey, "undated"> => key !== "undated",
);

export function journey(weddingDate: string | null, today: string) {
  const current = currentPhase(weddingDate, today);
  const index = current ? journeyPhases.indexOf(current as never) : -1;
  return journeyPhases.map((key, position) => ({
    key,
    state:
      index === -1
        ? ("upcoming" as const)
        : position < index
          ? ("past" as const)
          : position === index
            ? ("current" as const)
            : ("upcoming" as const),
  }));
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
