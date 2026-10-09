"use client";

import { useState, useTransition } from "react";
import { ChoiceChips } from "@/components/forms/choice-chips";
import { Field } from "@/components/forms/field";
import { FormActions } from "@/components/forms/form-actions";
import { MoneyInput } from "@/components/forms/money-input";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { toast } from "@/components/ui/toast";
import { saveWedding } from "@/lib/actions/wedding";
import { attempt, failed } from "@/lib/attempt";
import { m } from "@/lib/i18n";
import type { Enums } from "@/lib/supabase/database.types";
import type { Wedding } from "@/lib/supabase/server";

type Ceremony = Enums<"ceremony_kind">;
const reserves = [0, 5, 10, 15, 20];

export function WeddingForm({
  wedding,
  disabled,
}: {
  wedding: Wedding;
  disabled: boolean;
}) {
  const [partnerA, setPartnerA] = useState(wedding.partner_a);
  const [partnerB, setPartnerB] = useState(wedding.partner_b);
  const [date, setDate] = useState(wedding.wedding_date ?? "");
  const [city, setCity] = useState(wedding.city ?? "");
  const [ceremony, setCeremony] = useState<Ceremony>(wedding.ceremony);
  const [guests, setGuests] = useState(
    wedding.guest_estimate ? String(wedding.guest_estimate) : "",
  );
  const [budget, setBudget] = useState(wedding.budget_cents ?? 0);
  const [reserve, setReserve] = useState(wedding.contingency_percent);
  const [motto, setMotto] = useState(wedding.motto ?? "");
  const [status, setStatus] = useState("");
  const [saving, startSave] = useTransition();

  function save() {
    startSave(async () => {
      const estimate = Number.parseInt(guests, 10);
      const result = await attempt(
        saveWedding({
          partnerA,
          partnerB,
          weddingDate: date || null,
          city,
          ceremony,
          guestEstimate:
            Number.isFinite(estimate) && estimate > 0 ? estimate : null,
          budgetCents: budget > 0 ? budget : null,
          contingencyPercent: reserve,
          motto,
        }),
        failed,
      );
      if (!result.ok) {
        setStatus(
          Object.values(result.errors ?? {})[0]?.[0] ??
            result.message ??
            m.common.tryAgain,
        );
        return;
      }
      setStatus("");
      toast.add({ title: m.wedding.saved, type: "success" });
    });
  }

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        save();
      }}
      className="flex flex-col gap-6"
    >
      <fieldset disabled={disabled} className="flex min-w-0 flex-col gap-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <Field id="w-a" label={m.wedding.partnerA}>
            <Input
              id="w-a"
              maxLength={40}
              value={partnerA}
              onChange={(event) => setPartnerA(event.target.value)}
              className="bg-card dark:bg-card"
            />
          </Field>
          <Field id="w-b" label={m.wedding.partnerB}>
            <Input
              id="w-b"
              maxLength={40}
              value={partnerB}
              onChange={(event) => setPartnerB(event.target.value)}
              className="bg-card dark:bg-card"
            />
          </Field>
          <Field id="w-date" label={m.wedding.date}>
            <Input
              id="w-date"
              type="date"
              min="2000-01-01"
              max="2100-12-31"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="bg-card dark:bg-card"
            />
          </Field>
          <Field id="w-city" label={m.wedding.city}>
            <Input
              id="w-city"
              maxLength={80}
              autoComplete="address-level2"
              placeholder={m.wedding.cityPlaceholder}
              value={city}
              onChange={(event) => setCity(event.target.value)}
              className="bg-card dark:bg-card"
            />
          </Field>
        </div>
        <ChoiceChips
          legend={m.wedding.ceremony}
          name="ceremony"
          value={ceremony}
          onChange={(value) => setCeremony(value as Ceremony)}
          options={(["both", "religious", "civil"] as const).map((value) => ({
            value,
            label: m.ceremonies[value],
          }))}
        />
        <div className="grid gap-6 sm:grid-cols-2">
          <Field id="w-guests" label={m.wedding.guestEstimate}>
            <Input
              id="w-guests"
              inputMode="numeric"
              maxLength={4}
              value={guests}
              onChange={(event) =>
                setGuests(event.target.value.replace(/\D/g, ""))
              }
              className="bg-card tabular-nums dark:bg-card"
            />
          </Field>
          <Field id="w-budget" label={m.budget.totalLabel}>
            <MoneyInput id="w-budget" value={budget} onChange={setBudget} />
          </Field>
          <Field id="w-reserve" label={m.budget.reserveLabel}>
            <NativeSelect
              id="w-reserve"
              value={reserve}
              onChange={(event) => setReserve(Number(event.target.value))}
            >
              {reserves.map((value) => (
                <option key={value} value={value}>
                  {m.budget.reserveOption(value)}
                </option>
              ))}
            </NativeSelect>
          </Field>
        </div>
        <Field id="w-motto" label={m.wedding.motto} hint={m.wedding.mottoHint}>
          <Input
            id="w-motto"
            maxLength={200}
            placeholder={m.wedding.mottoPlaceholder}
            value={motto}
            onChange={(event) => setMotto(event.target.value)}
            aria-describedby="w-motto-hint"
            className="bg-card dark:bg-card"
          />
        </Field>
      </fieldset>
      {!disabled && (
        <FormActions
          status={status}
          saving={saving}
          busy={saving}
          submitLabel={m.common.save}
        />
      )}
    </form>
  );
}
