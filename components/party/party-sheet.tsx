"use client";

import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { useState, useTransition } from "react";
import { ChoiceChips } from "@/components/forms/choice-chips";
import { Field } from "@/components/forms/field";
import { SheetForm } from "@/components/forms/sheet-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { toast } from "@/components/ui/toast";
import {
  deletePartyMember,
  movePartyMember,
  savePartyMember,
} from "@/lib/actions/creative";
import { attempt, failed } from "@/lib/attempt";
import type { PartyMember } from "@/lib/data";
import { m } from "@/lib/i18n";
import { type PartyRole, partyRoles } from "@/lib/party";
import { Constants, type Enums } from "@/lib/supabase/database.types";

export function PartySheet({
  member,
  others,
  partnerA,
  partnerB,
}: {
  member: PartyMember | null;
  others: { id: string; name: string }[];
  partnerA: string;
  partnerB: string;
}) {
  const [id, setId] = useState(() => member?.id ?? crypto.randomUUID());
  const [name, setName] = useState(member?.name ?? "");
  const [role, setRole] = useState<PartyRole>(
    (member?.role as PartyRole) ?? "madrinha",
  );
  const [side, setSide] = useState<Enums<"guest_side">>(member?.side ?? "a");
  const [pairId, setPairId] = useState(member?.pair_id ?? "");
  const [attire, setAttire] = useState(member?.attire ?? "");
  const [invite, setInvite] = useState<Enums<"party_invite">>(
    member?.invite_status ?? "pending",
  );
  const [phone, setPhone] = useState(member?.phone ?? "");
  const [notes, setNotes] = useState(member?.notes ?? "");

  return (
    <SheetForm
      title={member ? member.name : m.party.newMember}
      trigger={member ? "edit" : "add"}
      triggerLabel={
        member ? `${m.common.edit}: ${member.name}` : m.party.newMember
      }
      savedMessage={m.party.saved}
      deletedMessage={m.party.deleted}
      onSave={() =>
        savePartyMember(
          {
            id,
            name,
            role,
            side,
            pairId: pairId || null,
            attire,
            inviteStatus: invite,
            phone,
            notes,
          },
          member === null,
        )
      }
      onDelete={member ? () => deletePartyMember(member.id) : undefined}
      onSaved={() => {
        if (member) return;
        setId(crypto.randomUUID());
        setName("");
        setPairId("");
        setAttire("");
        setPhone("");
        setNotes("");
      }}
    >
      <Field id={`p-name-${id}`} label={m.party.name}>
        <Input
          id={`p-name-${id}`}
          maxLength={80}
          autoComplete="off"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-background"
        />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id={`p-role-${id}`} label={m.party.role}>
          <NativeSelect
            id={`p-role-${id}`}
            value={role}
            onChange={(e) => setRole(e.target.value as PartyRole)}
          >
            {partyRoles.map((value) => (
              <option key={value} value={value}>
                {m.partyRoles[value]}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <Field id={`p-pair-${id}`} label={m.party.pair}>
          <NativeSelect
            id={`p-pair-${id}`}
            value={pairId}
            onChange={(e) => setPairId(e.target.value)}
          >
            <option value="">{m.party.noPair}</option>
            {others.map((other) => (
              <option key={other.id} value={other.id}>
                {other.name}
              </option>
            ))}
          </NativeSelect>
        </Field>
      </div>
      <ChoiceChips
        legend={m.party.side}
        name={`lado-${id}`}
        value={side}
        onChange={(value) => setSide(value as typeof side)}
        options={[
          { value: "a", label: m.guests.sideOf(partnerA) },
          { value: "b", label: m.guests.sideOf(partnerB) },
          { value: "both", label: m.guests.sideBoth },
        ]}
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id={`p-attire-${id}`} label={m.party.attire}>
          <Input
            id={`p-attire-${id}`}
            maxLength={120}
            autoComplete="off"
            placeholder={m.party.attirePlaceholder}
            value={attire}
            onChange={(e) => setAttire(e.target.value)}
            className="bg-background"
          />
        </Field>
        <Field id={`p-invite-${id}`} label={m.party.invite}>
          <NativeSelect
            id={`p-invite-${id}`}
            value={invite}
            onChange={(e) => setInvite(e.target.value as typeof invite)}
          >
            {Constants.public.Enums.party_invite.map((value) => (
              <option key={value} value={value}>
                {m.partyInvite[value]}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <Field id={`p-phone-${id}`} label={m.party.phone}>
          <Input
            id={`p-phone-${id}`}
            type="tel"
            inputMode="tel"
            maxLength={30}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="bg-background"
          />
        </Field>
      </div>
      <Field id={`p-notes-${id}`} label={m.party.notes}>
        <textarea
          id={`p-notes-${id}`}
          rows={3}
          maxLength={2000}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-base"
        />
      </Field>
    </SheetForm>
  );
}

export function MoveButtons({
  id,
  name,
  first,
  last,
}: {
  id: string;
  name: string;
  first: boolean;
  last: boolean;
}) {
  const [pending, startTransition] = useTransition();
  function go(delta: -1 | 1) {
    startTransition(async () => {
      const result = await attempt(movePartyMember(id, delta), failed);
      if (!result.ok)
        toast.add({
          title: result.message ?? m.common.tryAgain,
          type: "error",
        });
    });
  }
  return (
    <div className="flex">
      <Button
        type="button"
        variant="ghost"
        size="icon-lg"
        aria-label={m.party.moveUp(name)}
        disabled={first || pending}
        focusableWhenDisabled
        onClick={() => go(-1)}
      >
        <ChevronUpIcon aria-hidden="true" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-lg"
        aria-label={m.party.moveDown(name)}
        disabled={last || pending}
        focusableWhenDisabled
        onClick={() => go(1)}
      >
        <ChevronDownIcon aria-hidden="true" />
      </Button>
    </div>
  );
}
