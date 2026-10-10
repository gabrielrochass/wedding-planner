"use client";

import {
  ArrowLeftIcon,
  BrushIcon,
  Building2Icon,
  CakeIcon,
  CalendarHeartIcon,
  CameraIcon,
  ChurchIcon,
  CopyIcon,
  Flower2Icon,
  GemIcon,
  type LucideIcon,
  MessageCircleIcon,
  MusicIcon,
  PlaneIcon,
  ShirtIcon,
  SparklesIcon,
  UtensilsIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  type FormEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useTransition,
} from "react";
import { Rings } from "@/components/brand/rings";
import { CheckChips } from "@/components/forms/check-chips";
import { ChoiceChips } from "@/components/forms/choice-chips";
import { MoneyInput } from "@/components/forms/money-input";
import { StepDots } from "@/components/forms/step-dots";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import {
  createWedding,
  invitePartner,
  saveHeardFrom,
} from "@/lib/actions/wedding";
import { attempt, failed } from "@/lib/attempt";
import { type BudgetPriority, budgetPriorities } from "@/lib/budget";
import { type Booking, bookings } from "@/lib/checklist";
import { m } from "@/lib/i18n";
import {
  budgetPresets,
  type DateMode,
  dateModes,
  guestPresets,
  type HeardFrom,
  heardFrom,
  maxPriorities,
  type Persona,
  personas,
  toggle,
  weddingDateFor,
} from "@/lib/onboarding";
import type { Enums } from "@/lib/supabase/database.types";
import { cn } from "@/lib/utils";

const steps = [
  "names",
  "date",
  "ceremony",
  "size",
  "booked",
  "priorities",
] as const;
type Step = (typeof steps)[number];
type Ceremony = Enums<"ceremony_kind">;

const bookingIcons: Record<Booking, LucideIcon> = {
  espaco: Building2Icon,
  cerimonia: ChurchIcon,
  assessoria: SparklesIcon,
  buffet: UtensilsIcon,
  fotos: CameraIcon,
  musica: MusicIcon,
  decoracao: Flower2Icon,
  doces: CakeIcon,
  traje: ShirtIcon,
  aliancas: GemIcon,
  beleza: BrushIcon,
  "lua-de-mel": PlaneIcon,
};

const priorityIcons: Record<BudgetPriority, LucideIcon> = {
  espaco: Building2Icon,
  comida: UtensilsIcon,
  fotos: CameraIcon,
  decoracao: Flower2Icon,
  musica: MusicIcon,
  traje: ShirtIcon,
  doces: CakeIcon,
  "lua-de-mel": PlaneIcon,
};

function icon(Icon: LucideIcon) {
  return <Icon aria-hidden="true" className="size-4 shrink-0" />;
}

function Field({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  children: ReactNode;
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
  const [id] = useState(() => crypto.randomUUID());
  const [step, setStep] = useState<Step>("names");
  const [persona, setPersona] = useState<Persona>("couple");
  const [partnerA, setPartnerA] = useState(firstName);
  const [partnerB, setPartnerB] = useState("");
  const [dateMode, setDateMode] = useState<DateMode>("exact");
  const [date, setDate] = useState("");
  const [month, setMonth] = useState("");
  const [city, setCity] = useState("");
  const [ceremony, setCeremony] = useState<Ceremony>("both");
  const [guests, setGuests] = useState("");
  const [budget, setBudget] = useState(0);
  const [booked, setBooked] = useState<Booking[]>([]);
  const [priorities, setPriorities] = useState<BudgetPriority[]>([]);
  const [error, setError] = useState("");
  const [created, setCreated] = useState<{
    tasks: number;
    done: number;
  } | null>(null);
  const [invited, setInvited] = useState(false);
  const [pending, startTransition] = useTransition();
  const index = steps.indexOf(step);
  const ids = {
    a: useId(),
    b: useId(),
    date: useId(),
    month: useId(),
    city: useId(),
    guests: useId(),
    budget: useId(),
  };
  const focusOnMount = useCallback(
    (element: HTMLHeadingElement | null) => element?.focus(),
    [],
  );
  const a = partnerA.trim();
  const b = partnerB.trim();

  function go(target: Step) {
    setError("");
    setStep(target);
  }

  function choosePersona(value: Persona) {
    setPersona(value);
    if (value !== "couple" && partnerA === firstName) setPartnerA("");
    if (value === "couple" && !partnerA) setPartnerA(firstName);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step === "names") {
      if (!a || !b) return setError(m.wedding.partnerRequired);
      return go("date");
    }
    if (step !== "priorities") return go(steps[index + 1]);
    startTransition(async () => {
      const guestEstimate = Number.parseInt(guests, 10);
      const when = weddingDateFor(dateMode, date, month);
      const result = await attempt(
        createWedding({
          id,
          persona,
          partnerA: a,
          partnerB: b,
          weddingDate: when.date,
          dateIsEstimate: when.estimate,
          city,
          ceremony,
          guestEstimate:
            Number.isFinite(guestEstimate) && guestEstimate > 0
              ? Math.min(guestEstimate, 5000)
              : null,
          budgetCents: budget > 0 ? budget : null,
          booked,
          priorities,
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
      setCreated({ tasks: result.tasks ?? 0, done: result.done ?? 0 });
    });
  }

  if (created && !invited) {
    return (
      <InvitePartner
        persona={persona}
        partner={persona === "couple" ? b : null}
        onDone={() => setInvited(true)}
      />
    );
  }

  if (created) {
    return <Ready couple={m.home.couple(a, b)} {...created} />;
  }

  const question = {
    names: m.onboarding.namesQuestion,
    date: m.onboarding.dateQuestion,
    ceremony: m.onboarding.ceremonyQuestion,
    size: m.onboarding.sizeQuestion,
    booked: m.onboarding.bookedQuestion,
    priorities: m.onboarding.prioritiesQuestion,
  }[step];
  const hint = {
    names: m.onboarding.namesHint,
    date: m.onboarding.dateHint,
    ceremony: m.onboarding.ceremonyHint,
    size: m.onboarding.sizeHint,
    booked: m.onboarding.bookedHint,
    priorities: m.onboarding.prioritiesHint,
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
          <>
            <ChoiceChips
              legend={m.onboarding.personaLegend}
              name="persona"
              value={persona}
              onChange={(value) => choosePersona(value as Persona)}
              options={personas.map((value) => ({
                value,
                label: m.onboarding.personas[value],
              }))}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id={ids.a} label={m.wedding.partnerA}>
                <Input
                  id={ids.a}
                  autoComplete={persona === "couple" ? "given-name" : "off"}
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
          </>
        )}

        {step === "date" && (
          <div className="flex flex-col gap-4">
            <ChoiceChips
              legend={m.onboarding.dateModeLegend}
              name="quando"
              value={dateMode}
              onChange={(value) => setDateMode(value as DateMode)}
              options={dateModes.map((value) => ({
                value,
                label: m.onboarding.dateModes[value],
              }))}
            />
            {dateMode === "exact" && (
              <Field id={ids.date} label={m.wedding.date}>
                <Input
                  id={ids.date}
                  type="date"
                  min="2020-01-01"
                  max="2100-12-31"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  className="bg-card dark:bg-card"
                />
              </Field>
            )}
            {dateMode === "month" && (
              <Field
                id={ids.month}
                label={m.onboarding.month}
                hint={m.onboarding.monthHint}
              >
                <Input
                  id={ids.month}
                  type="month"
                  min="2020-01"
                  max="2100-12"
                  value={month}
                  onChange={(event) => setMonth(event.target.value)}
                  className="bg-card dark:bg-card"
                />
              </Field>
            )}
            {dateMode === "unknown" && (
              <p className="rounded-2xl bg-card p-4 text-body text-muted-foreground">
                {m.onboarding.unknownHint}
              </p>
            )}
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
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-3">
              <ChoiceChips
                legend={m.wedding.guestEstimate}
                name="convidados"
                value={guests}
                onChange={setGuests}
                options={guestPresets.map((value) => ({
                  value: String(value),
                  label: m.onboarding.guestPreset(value),
                }))}
              />
              <Field id={ids.guests} label={m.onboarding.otherGuests}>
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
            </div>
            <div className="flex flex-col gap-3">
              <ChoiceChips
                legend={m.wedding.budget}
                name="orcamento"
                value={String(budget)}
                onChange={(value) => setBudget(Number(value))}
                options={budgetPresets.map((value, position) => ({
                  value: String(value),
                  label: m.onboarding.budgetPreset(
                    value,
                    position === budgetPresets.length - 1,
                  ),
                }))}
              />
              <Field id={ids.budget} label={m.onboarding.otherBudget}>
                <MoneyInput
                  id={ids.budget}
                  value={budget}
                  onChange={setBudget}
                />
              </Field>
            </div>
          </div>
        )}

        {step === "booked" && (
          <CheckChips
            legend={m.onboarding.bookedLegend}
            name="garantido"
            value={booked}
            onChange={(value) => setBooked(toggle(booked, value as Booking))}
            options={bookings
              .filter((value) => value !== "cerimonia" || ceremony !== "civil")
              .map((value) => ({
                value,
                label: m.onboarding.bookings[value],
                icon: icon(bookingIcons[value]),
              }))}
          />
        )}

        {step === "priorities" && (
          <CheckChips
            legend={m.onboarding.prioritiesLegend(priorities.length)}
            name="prioridades"
            value={priorities}
            max={maxPriorities}
            onChange={(value) =>
              setPriorities(
                toggle(priorities, value as BudgetPriority, maxPriorities),
              )
            }
            options={budgetPriorities.map((value) => ({
              value,
              label: m.onboarding.priorities[value],
              icon: icon(priorityIcons[value]),
            }))}
          />
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
          {step === "priorities"
            ? pending
              ? m.onboarding.finishing
              : m.onboarding.finish
            : m.onboarding.next}
        </Button>
      </div>
    </form>
  );
}

function InvitePartner({
  persona,
  partner,
  onDone,
}: {
  persona: Persona;
  partner: string | null;
  onDone: () => void;
}) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const requested = useRef(false);
  const focusOnMount = useCallback(
    (element: HTMLHeadingElement | null) => element?.focus(),
    [],
  );

  useEffect(() => {
    if (requested.current) return;
    requested.current = true;
    attempt(invitePartner(), failed).then((result) => {
      if (result.ok) {
        setUrl(`${window.location.origin}/convite/${result.token}`);
      } else {
        setError(m.onboarding.inviteFailed);
      }
    });
  }, []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      toast.add({ title: m.team.copied, type: "success" });
    } catch {
      document.getElementById("convite-url")?.focus();
    }
  }

  const message = partner
    ? m.onboarding.partnerMessage(partner, url)
    : m.onboarding.coupleMessage(url);

  return (
    <section className="flex animate-step-in flex-col gap-6">
      <Rings className="h-12 w-20" />
      <div className="flex flex-col gap-1">
        <h1
          ref={focusOnMount}
          tabIndex={-1}
          className="font-display text-large-title font-bold tracking-tight text-balance"
        >
          {partner
            ? m.onboarding.inviteQuestion(partner)
            : m.onboarding.inviteCoupleQuestion}
        </h1>
        <p className="text-body text-muted-foreground">
          {persona === "couple"
            ? m.onboarding.inviteHint
            : m.onboarding.inviteCoupleHint}
        </p>
      </div>
      {url && (
        <div className="flex flex-col gap-3">
          <input
            id="convite-url"
            readOnly
            value={url}
            onFocus={(event) => event.target.select()}
            aria-label={m.invite.title}
            className="h-11 w-full rounded-lg border border-input bg-card px-3 text-base"
          />
          <a
            href={`https://wa.me/?text=${encodeURIComponent(message)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ size: "lg" }))}
          >
            <MessageCircleIcon aria-hidden="true" />
            {m.team.sendWhatsapp}
          </a>
          <Button type="button" size="lg" variant="secondary" onClick={copy}>
            <CopyIcon aria-hidden="true" />
            {m.team.copy}
          </Button>
        </div>
      )}
      <output className="block min-h-5 text-footnote text-destructive">
        {error}
      </output>
      <Button
        type="button"
        size="lg"
        variant="ghost"
        className="text-link"
        onClick={onDone}
      >
        {url ? m.onboarding.inviteLater : m.onboarding.next}
      </Button>
    </section>
  );
}

function Ready({
  couple,
  tasks,
  done,
}: {
  couple: string;
  tasks: number;
  done: number;
}) {
  const router = useRouter();
  const [source, setSource] = useState<HeardFrom | null>(null);
  const [pending, startTransition] = useTransition();
  const focusOnMount = useCallback(
    (element: HTMLHeadingElement | null) => element?.focus(),
    [],
  );

  function enter() {
    startTransition(async () => {
      if (source) await attempt(saveHeardFrom(source), failed);
      router.replace("/");
    });
  }

  return (
    <section className="flex animate-step-in flex-col items-center gap-8 text-center">
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
          {m.onboarding.readyHint(tasks, done)}
        </p>
      </div>
      <div className="w-full text-left">
        <ChoiceChips
          legend={m.onboarding.heardLegend}
          name="origem"
          value={source}
          onChange={(value) => setSource(value as HeardFrom)}
          options={heardFrom.map((value) => ({
            value,
            label: m.onboarding.heard[value],
          }))}
        />
      </div>
      <Button
        size="lg"
        className="w-full"
        onClick={enter}
        disabled={pending}
        focusableWhenDisabled
      >
        <CalendarHeartIcon aria-hidden="true" />
        {couple}
      </Button>
    </section>
  );
}
