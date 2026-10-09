"use client";

import { PlusIcon, UserPlusIcon, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { ChoiceChips } from "@/components/forms/choice-chips";
import { describedBy, Field } from "@/components/forms/field";
import { FormActions } from "@/components/forms/form-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { toast } from "@/components/ui/toast";
import { useGoBack } from "@/hooks/use-go-back";
import { useToday } from "@/hooks/use-today";
import { deleteHousehold, saveHousehold } from "@/lib/actions/guests";
import { attempt, failed } from "@/lib/attempt";
import type { Guest, Household } from "@/lib/data";
import { formatShortDate } from "@/lib/dates";
import { ageBands, lists, rsvps } from "@/lib/guests";
import { m } from "@/lib/i18n";
import type { Enums } from "@/lib/supabase/database.types";

type Member = {
  id: string;
  name: string;
  ageBand: Enums<"age_band">;
  rsvp: Enums<"rsvp_status">;
  isPlusOne: boolean;
  dietary: string;
};

type Marks = { saveTheDate: string; invited: string; thanked: string };

const blank = (plusOne = false, name = ""): Member => ({
  id: crypto.randomUUID(),
  name,
  ageBand: "adult",
  rsvp: "pending",
  isPlusOne: plusOne,
  dietary: "",
});

export function HouseholdEditor({
  household,
  partnerA,
  partnerB,
}: {
  household: (Household & { members: Guest[] }) | null;
  partnerA: string;
  partnerB: string;
}) {
  const goBack = useGoBack("/convidados");
  const router = useRouter();
  const today = useToday();
  const [id] = useState(() => household?.id ?? crypto.randomUUID());
  const [name, setName] = useState(household?.name ?? "");
  const [side, setSide] = useState<Enums<"guest_side">>(
    household?.side ?? "both",
  );
  const [list, setList] = useState<Enums<"guest_list">>(household?.list ?? "a");
  const [phone, setPhone] = useState(household?.phone ?? "");
  const [address, setAddress] = useState(household?.address ?? "");
  const [notes, setNotes] = useState(household?.notes ?? "");
  const [gift, setGift] = useState(household?.gift ?? "");
  const [marks, setMarks] = useState<Marks>({
    saveTheDate: household?.save_the_date_on ?? "",
    invited: household?.invited_on ?? "",
    thanked: household?.thanked_on ?? "",
  });
  const [members, setMembers] = useState<Member[]>(() =>
    household?.members.length
      ? household.members.map((g) => ({
          id: g.id,
          name: g.name,
          ageBand: g.age_band,
          rsvp: g.rsvp,
          isPlusOne: g.is_plus_one,
          dietary: g.dietary ?? "",
        }))
      : [blank()],
  );
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [status, setStatus] = useState("");
  const [saving, startSave] = useTransition();
  const [removing, startRemove] = useTransition();
  const nameRef = useRef<HTMLInputElement>(null);

  function update(index: number, patch: Partial<Member>) {
    setMembers((current) =>
      current.map((member, i) =>
        i === index ? { ...member, ...patch } : member,
      ),
    );
  }

  function toggle(mark: keyof Marks, checked: boolean) {
    setMarks((current) => ({
      ...current,
      [mark]: checked ? current[mark] || today : "",
    }));
  }

  function save() {
    startSave(async () => {
      const result = await attempt(
        saveHousehold(
          {
            id,
            name: name.trim() || members[0]?.name.trim() || "",
            side,
            list,
            phone,
            address,
            notes,
            saveTheDateOn: marks.saveTheDate || null,
            invitedOn: marks.invited || null,
            gift,
            thankedOn: marks.thanked || null,
            members: members
              .map((member) => ({
                ...member,
                name:
                  member.name.trim() ||
                  (member.isPlusOne ? m.guests.plusOne : ""),
              }))
              .filter((member) => member.name),
          },
          household === null,
        ),
        failed,
      );
      if (!result.ok) {
        const found = Object.fromEntries(
          Object.entries(result.errors ?? {}).map(([k, v]) => [k, v?.[0]]),
        );
        setErrors(found);
        setStatus(found.members ?? result.message ?? "");
        if (found.name) nameRef.current?.focus();
        return;
      }
      toast.add({
        title: household ? m.guests.saved : m.guests.created,
        type: "success",
      });
      goBack();
    });
  }

  function remove() {
    if (!household) return;
    startRemove(async () => {
      const result = await attempt(deleteHousehold(household.id), failed);
      if (!result.ok) {
        setStatus(result.message ?? m.common.tryAgain);
        return;
      }
      toast.add({ title: m.guests.deleted });
      router.replace("/convidados");
    });
  }

  const markRows: [keyof Marks, string][] = [
    ["saveTheDate", m.guests.markSaveTheDate],
    ["invited", m.guests.markInvited],
  ];

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        save();
      }}
      className="flex flex-col gap-6"
    >
      <Field id="h-name" label={m.guests.householdName} error={errors.name}>
        <Input
          ref={nameRef}
          id="h-name"
          maxLength={80}
          autoComplete="off"
          placeholder={m.guests.householdPlaceholder}
          value={name}
          onChange={(event) => setName(event.target.value)}
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={describedBy("h-name", { error: errors.name })}
          className="bg-card dark:bg-card"
        />
      </Field>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-2 text-headline font-semibold">
          {m.guests.members}
        </legend>
        <ul className="flex flex-col gap-3">
          {members.map((member, index) => (
            <li
              key={member.id}
              className="flex flex-col gap-3 rounded-2xl bg-card p-3"
            >
              <div className="flex items-center gap-2">
                <Input
                  aria-label={m.guests.memberName(index + 1)}
                  maxLength={80}
                  autoComplete="off"
                  placeholder={member.isPlusOne ? m.guests.plusOne : undefined}
                  value={member.name}
                  onChange={(event) =>
                    update(index, { name: event.target.value })
                  }
                  className="bg-background"
                />
                {members.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-lg"
                    aria-label={m.guests.removeMember(
                      member.name || m.guests.memberName(index + 1),
                    )}
                    onClick={() =>
                      setMembers((current) =>
                        current.filter((_, i) => i !== index),
                      )
                    }
                  >
                    <XIcon aria-hidden="true" className="size-5" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                <NativeSelect
                  aria-label={`${m.guests.ageBand}: ${member.name || m.guests.memberName(index + 1)}`}
                  value={member.ageBand}
                  onChange={(event) =>
                    update(index, {
                      ageBand: event.target.value as Member["ageBand"],
                    })
                  }
                  className="bg-background"
                >
                  {ageBands.map((band) => (
                    <option key={band} value={band}>
                      {m.ageBands[band]}
                    </option>
                  ))}
                </NativeSelect>
                {household === null && (
                  <NativeSelect
                    aria-label={`${m.guests.rsvp}: ${member.name || m.guests.memberName(index + 1)}`}
                    value={member.rsvp}
                    onChange={(event) =>
                      update(index, {
                        rsvp: event.target.value as Member["rsvp"],
                      })
                    }
                    className="bg-background"
                  >
                    {rsvps.map((value) => (
                      <option key={value} value={value}>
                        {m.rsvp[value]}
                      </option>
                    ))}
                  </NativeSelect>
                )}
                <Input
                  aria-label={`${m.guests.dietary}: ${member.name || m.guests.memberName(index + 1)}`}
                  placeholder={m.guests.dietary}
                  maxLength={120}
                  value={member.dietary}
                  onChange={(event) =>
                    update(index, { dietary: event.target.value })
                  }
                  className="col-span-2 bg-background sm:col-span-1"
                />
              </div>
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={() => setMembers((c) => [...c, blank()])}
          >
            <PlusIcon aria-hidden="true" />
            {m.guests.addMember}
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={() => setMembers((c) => [...c, blank(true)])}
          >
            <UserPlusIcon aria-hidden="true" />
            {m.guests.addPlusOne}
          </Button>
        </div>
      </fieldset>

      <ChoiceChips
        legend={m.guests.side}
        name="side"
        value={side}
        onChange={(value) => setSide(value as typeof side)}
        options={[
          { value: "a", label: m.guests.sideOf(partnerA) },
          { value: "b", label: m.guests.sideOf(partnerB) },
          { value: "both", label: m.guests.sideBoth },
        ]}
      />
      <ChoiceChips
        legend={m.guests.list}
        name="list"
        value={list}
        onChange={(value) => setList(value as typeof list)}
        options={lists.map((value) => ({ value, label: m.lists[value] }))}
      />

      <div className="grid gap-6 sm:grid-cols-2">
        <Field id="h-phone" label={m.guests.phone}>
          <Input
            id="h-phone"
            type="tel"
            inputMode="tel"
            autoComplete="off"
            maxLength={30}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="bg-card dark:bg-card"
          />
        </Field>
        <Field id="h-address" label={m.guests.address}>
          <Input
            id="h-address"
            autoComplete="off"
            maxLength={300}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="bg-card dark:bg-card"
          />
        </Field>
      </div>

      <fieldset className="flex flex-col gap-1 rounded-2xl bg-card p-3">
        <legend className="sr-only">{m.guests.funnel}</legend>
        {markRows.map(([mark, label]) => (
          <label
            key={mark}
            className="flex min-h-11 items-center gap-3 px-1 text-body"
          >
            <input
              type="checkbox"
              checked={Boolean(marks[mark])}
              onChange={(event) => toggle(mark, event.target.checked)}
              className="size-5 accent-primary"
            />
            <span className="flex-1">{label}</span>
            {marks[mark] && (
              <span className="text-footnote text-muted-foreground tabular-nums">
                {formatShortDate(marks[mark])}
              </span>
            )}
          </label>
        ))}
      </fieldset>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field id="h-gift" label={m.guests.gift}>
          <Input
            id="h-gift"
            maxLength={120}
            autoComplete="off"
            placeholder={m.guests.giftPlaceholder}
            value={gift}
            onChange={(e) => setGift(e.target.value)}
            className="bg-card dark:bg-card"
          />
        </Field>
        <label className="flex min-h-11 items-center gap-3 self-end text-body">
          <input
            type="checkbox"
            checked={Boolean(marks.thanked)}
            onChange={(event) => toggle("thanked", event.target.checked)}
            className="size-5 accent-primary"
          />
          {m.guests.thanked}
        </label>
      </div>

      <Field id="h-notes" label={m.guests.notes}>
        <textarea
          id="h-notes"
          rows={3}
          maxLength={2000}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full rounded-lg border border-input bg-card px-3 py-2 text-base"
        />
      </Field>

      <FormActions
        status={status}
        saving={saving}
        busy={saving || removing}
        submitLabel={household ? m.common.save : m.guests.newHousehold}
        onDelete={household ? remove : undefined}
      />
    </form>
  );
}
