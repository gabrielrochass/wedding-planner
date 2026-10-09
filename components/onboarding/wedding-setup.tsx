"use client";

import { ArrowLeftIcon, CalendarHeartIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  type FormEvent,
  useCallback,
  useId,
  useState,
  useTransition,
} from "react";
import { Rings } from "@/components/brand/rings";
import { ChoiceChips } from "@/components/forms/choice-chips";
import { MoneyInput } from "@/components/forms/money-input";
import { StepDots } from "@/components/forms/step-dots";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createWedding } from "@/lib/actions/wedding";
import { attempt, failed } from "@/lib/attempt";
import { m } from "@/lib/i18n";
import type { Enums } from "@/lib/supabase/database.types";

const steps = ["names", "date", "ceremony", "size"] as const;
type Step = (typeof steps)[number];
type Ceremony = Enums<"ceremony_kind">;

function Field({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={id}
        className="text-footnote font-medium text-muted-foreground"
      >
        {label}
      </label>
      {children}
      {hint && <p className="text-footnote text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function WeddingSetup({ firstName }: { firstName: string }) {
  const router = useRouter();
  const [id] = useState(() => crypto.randomUUID());
  const [step, setStep] = useState<Step>("names");
  const [partnerA, setPartnerA] = useState(firstName);
  const [partnerB, setPartnerB] = useState("");
  const [date, setDate] = useState("");
  const [noDate, setNoDate] = useState(false);
  const [city, setCity] = useState("");
  const [ceremony, setCeremony] = useState<Ceremony>("both");
  const [guests, setGuests] = useState("");
  const [budget, setBudget] = useState(0);
  const [error, setError] = useState("");
  const [created, setCreated] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();
  const index = steps.indexOf(step);
  const ids = {
    a: useId(),
    b: useId(),
    date: useId(),
    noDate: useId(),
    city: useId(),
    guests: useId(),
    budget: useId(),
  };
  const focusOnMount = useCallback(
    (element: HTMLHeadingElement | null) => element?.focus(),
    [],
  );

  function go(target: Step) {
    setError("");
    setStep(target);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step === "names") {
      if (!partnerA.trim() || !partnerB.trim()) {
        return setError(m.wedding.partnerRequired);
      }
      return go("date");
    }
    if (step === "date") return go("ceremony");
    if (step === "ceremony") return go("size");
    startTransition(async () => {
      const guestEstimate = Number.parseInt(guests, 10);
      const result = await attempt(
        createWedding({
          id,
          partnerA: partnerA.trim(),
          partnerB: partnerB.trim(),
          weddingDate: noDate || !date ? null : date,
          city,
          ceremony,
          guestEstimate:
            Number.isFinite(guestEstimate) && guestEstimate > 0
              ? Math.min(guestEstimate, 5000)
              : null,
          budgetCents: budget > 0 ? budget : null,
        }),
        failed,
      );
      if (!result.ok) {
        setError(
          Object.values(result.errors ?? {})[0]?.[0] ??
            result.message ??
            m.common.tryAgain,
        );
        return;
      }
      setCreated(result.tasks ?? 0);
    });
  }

  if (created !== null) {
    return (
      <section className="flex animate-step-in flex-col items-center gap-6 text-center">
        <Rings className="h-16 w-24" />
        <div className="flex flex-col gap-2">
          <h1
            ref={focusOnMount}
            tabIndex={-1}
            className="font-display text-large-title font-bold tracking-tight text-balance"
          >
            {m.onboarding.ready}
          </h1>
          <p className="text-body text-muted-foreground text-balance">
            {m.onboarding.readyHint(created)}
          </p>
        </div>
        <Button
          size="lg"
          className="w-full"
          onClick={() => router.replace("/")}
        >
          <CalendarHeartIcon aria-hidden="true" />
          {m.home.couple(partnerA.trim(), partnerB.trim())}
        </Button>
      </section>
    );
  }

  const question = {
    names: m.onboarding.namesQuestion,
    date: m.onboarding.dateQuestion,
    ceremony: m.onboarding.ceremonyQuestion,
    size: m.onboarding.sizeQuestion,
  }[step];
  const hint = {
    names: m.onboarding.namesHint,
    date: m.onboarding.dateHint,
    ceremony: m.onboarding.ceremonyHint,
    size: m.onboarding.sizeHint,
  }[step];

  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-6">
      <div className="flex min-h-11 items-center justify-between">
        {index > 0 ? (
          <Button
            type="button"
            variant="ghost"
            size="lg"
            className="-ml-3 text-link"
            onClick={() => go(steps[index - 1])}
          >
            <ArrowLeftIcon aria-hidden="true" />
            {m.onboarding.back}
          </Button>
        ) : (
          <Rings />
        )}
        <StepDots total={steps.length} current={index} />
      </div>

      <div key={step} className="flex animate-step-in flex-col gap-6">
        <div className="flex flex-col gap-1">
          <p className="text-footnote font-medium text-muted-foreground">
            {m.onboarding.step(index + 1, steps.length)}
          </p>
          <h1
            ref={index > 0 ? focusOnMount : undefined}
            tabIndex={-1}
            className="font-display text-large-title font-bold tracking-tight text-balance"
          >
            {question}
          </h1>
          <p className="text-body text-muted-foreground">{hint}</p>
        </div>

        {step === "names" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id={ids.a} label={m.wedding.partnerA}>
              <Input
                id={ids.a}
                autoComplete="given-name"
                maxLength={40}
                value={partnerA}
                onChange={(event) => setPartnerA(event.target.value)}
                placeholder={m.wedding.partnerPlaceholder}
                className="bg-card dark:bg-card"
              />
            </Field>
            <Field id={ids.b} label={m.wedding.partnerB}>
              <Input
                id={ids.b}
                autoComplete="off"
                maxLength={40}
                value={partnerB}
                onChange={(event) => setPartnerB(event.target.value)}
                className="bg-card dark:bg-card"
              />
            </Field>
          </div>
        )}

        {step === "date" && (
          <div className="flex flex-col gap-4">
            <Field id={ids.date} label={m.wedding.date}>
              <Input
                id={ids.date}
                type="date"
                min="2020-01-01"
                max="2100-12-31"
                disabled={noDate}
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="bg-card dark:bg-card"
              />
            </Field>
            <label
              htmlFor={ids.noDate}
              className="flex min-h-11 items-center gap-3 text-body"
            >
              <input
                id={ids.noDate}
                type="checkbox"
                checked={noDate}
                onChange={(event) => setNoDate(event.target.checked)}
                className="size-5 accent-primary"
              />
              {m.wedding.noDate}
            </label>
            <Field id={ids.city} label={m.wedding.city}>
              <Input
                id={ids.city}
                autoComplete="address-level2"
                maxLength={80}
                value={city}
                onChange={(event) => setCity(event.target.value)}
                placeholder={m.wedding.cityPlaceholder}
                className="bg-card dark:bg-card"
              />
            </Field>
          </div>
        )}

        {step === "ceremony" && (
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
        )}

        {step === "size" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id={ids.guests} label={m.wedding.guestEstimate}>
              <Input
                id={ids.guests}
                inputMode="numeric"
                autoComplete="off"
                maxLength={4}
                value={guests}
                onChange={(event) =>
                  setGuests(event.target.value.replace(/\D/g, ""))
                }
                placeholder="150"
                className="bg-card tabular-nums dark:bg-card"
              />
            </Field>
            <Field id={ids.budget} label={m.wedding.budget}>
              <MoneyInput id={ids.budget} value={budget} onChange={setBudget} />
            </Field>
          </div>
        )}

        <output className="block min-h-5 text-footnote text-destructive">
          {error}
        </output>

        <Button
          type="submit"
          size="lg"
          disabled={pending}
          focusableWhenDisabled
        >
          {step === "size"
            ? pending
              ? m.onboarding.finishing
              : m.onboarding.finish
            : m.onboarding.next}
        </Button>
      </div>
    </form>
  );
}
