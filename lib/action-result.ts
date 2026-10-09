import { m } from "@/lib/i18n";

export type ActionResult =
  | { ok: true }
  | {
      ok: false;
      errors?: Record<string, string[] | undefined>;
      message?: string;
    };

export const failure = { ok: false, message: m.common.tryAgain } as const;

export const forbidden = { ok: false, message: m.common.noPermission } as const;

export function failureFor(
  error: { code?: string },
  messages: Partial<Record<string, ActionResult>> = {},
): ActionResult {
  const custom = error.code ? messages[error.code] : undefined;
  if (custom) return custom;
  if (error.code === "42501") return forbidden;
  if (error.code === "54000")
    return { ok: false, message: m.common.limitReached };
  if (error.code === "23505") {
    return { ok: false, errors: { name: [m.common.nameTaken] } };
  }
  return failure;
}
