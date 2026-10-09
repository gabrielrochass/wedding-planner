import type { Enums } from "@/lib/supabase/database.types";

export type Role = Enums<"member_role">;

export const roles = [
  "couple",
  "planner",
  "helper",
  "viewer",
] as const satisfies readonly Role[];

export function canEdit(role: Role) {
  return role === "couple" || role === "planner";
}

export function canHelp(role: Role) {
  return canEdit(role) || role === "helper";
}

export function canManageTeam(role: Role) {
  return role === "couple";
}
