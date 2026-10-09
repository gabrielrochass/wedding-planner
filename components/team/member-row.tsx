"use client";

import { UserRoundXIcon } from "lucide-react";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import { toast } from "@/components/ui/toast";
import { changeRole, removeMember, revokeInvite } from "@/lib/actions/wedding";
import { attempt, failed } from "@/lib/attempt";
import { m } from "@/lib/i18n";
import { type Role, roles } from "@/lib/roles";

function report(result: { ok: boolean; message?: string }, success: string) {
  toast.add({
    title: result.ok ? success : (result.message ?? m.common.tryAgain),
    type: result.ok ? "success" : "error",
  });
}

export function MemberControls({
  userId,
  name,
  role,
}: {
  userId: string;
  name: string;
  role: Role;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2">
      <NativeSelect
        aria-label={m.team.changeRole(name)}
        value={role}
        disabled={pending}
        onChange={(event) => {
          const next = event.target.value;
          startTransition(async () =>
            report(
              await attempt(changeRole(userId, next), failed),
              m.team.roleChanged,
            ),
          );
        }}
        className="h-10 w-auto"
      >
        {roles.map((value) => (
          <option key={value} value={value}>
            {m.roles[value]}
          </option>
        ))}
      </NativeSelect>
      <Button
        type="button"
        variant="ghost"
        size="icon-lg"
        aria-label={m.team.remove(name)}
        disabled={pending}
        focusableWhenDisabled
        onClick={() =>
          startTransition(async () =>
            report(await attempt(removeMember(userId), failed), m.team.removed),
          )
        }
      >
        <UserRoundXIcon aria-hidden="true" className="size-5" />
      </Button>
    </div>
  );
}

export function RevokeInvite({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      type="button"
      variant="ghost"
      size="lg"
      className="text-destructive"
      disabled={pending}
      focusableWhenDisabled
      onClick={() =>
        startTransition(async () =>
          report(await attempt(revokeInvite(id), failed), m.team.revoked),
        )
      }
    >
      {m.team.revoke}
    </Button>
  );
}
