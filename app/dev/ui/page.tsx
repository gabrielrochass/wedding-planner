import { PlusIcon } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BudgetDonut } from "@/components/budget/budget-donut";
import { PaymentBadge } from "@/components/budget/payment-badge";
import { GuestSummary } from "@/components/guests/guest-summary";
import { Journey } from "@/components/home/journey";
import { Milestones } from "@/components/home/milestones";
import { ProgressRing } from "@/components/home/progress-ring";
import { TaskBadge } from "@/components/tasks/task-badge";
import { Button } from "@/components/ui/button";
import { headcount } from "@/lib/guests";
import { journey, milestones } from "@/lib/wedding";

export const metadata: Metadata = {
  title: "Galeria de componentes",
  robots: { index: false },
};

const variants = [
  "default",
  "secondary",
  "outline",
  "ghost",
  "destructive",
  "link",
] as const;

const textTokens = [
  ["text-foreground", "Texto principal"],
  ["text-muted-foreground", "Texto secundário"],
  ["text-link", "Link e destaque da marca"],
  ["text-success", "Pago, confirmado"],
  ["text-danger", "Atrasado, não vai"],
  ["text-warning", "Vence em breve"],
  ["text-destructive", "Erro de formulário"],
] as const;

const sampleCount = headcount(
  [
    {
      id: "1",
      side: "a",
      list: "a",
      save_the_date_on: "2027-06-01",
      invited_on: "2027-11-01",
      thanked_on: null,
      gift: null,
    },
    {
      id: "2",
      side: "b",
      list: "a",
      save_the_date_on: "2027-06-01",
      invited_on: null,
      thanked_on: null,
      gift: null,
    },
    {
      id: "3",
      side: "both",
      list: "a",
      save_the_date_on: null,
      invited_on: null,
      thanked_on: null,
      gift: null,
    },
    {
      id: "4",
      side: "a",
      list: "b",
      save_the_date_on: null,
      invited_on: null,
      thanked_on: null,
      gift: null,
    },
  ],
  [
    { household_id: "1", age_band: "adult", rsvp: "yes" },
    { household_id: "1", age_band: "child", rsvp: "yes" },
    { household_id: "2", age_band: "adult", rsvp: "no" },
    { household_id: "2", age_band: "teen", rsvp: "pending" },
    { household_id: "3", age_band: "adult", rsvp: "pending" },
    { household_id: "4", age_band: "adult", rsvp: "pending" },
  ],
);

function Samples() {
  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-col gap-1">
        {textTokens.map(([className, label]) => (
          <li key={className} className={className}>
            {label}
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {(["paid", "overdue", "soon", "later"] as const).map((state) => (
          <PaymentBadge key={state} state={state} />
        ))}
        {(["done", "overdue", "soon", "later", "undated"] as const).map(
          (state) => (
            <TaskBadge key={state} state={state} />
          ),
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {variants.map((variant) => (
          <Button key={variant} variant={variant} size="lg">
            <PlusIcon aria-hidden="true" />
            {variant}
          </Button>
        ))}
      </div>
    </div>
  );
}

export default function DevUiPage() {
  if (!process.env.DEV_UI) notFound();

  return (
    <main id="conteudo" className="mx-auto flex max-w-3xl flex-col gap-6 p-4">
      <h1 className="font-display text-large-title font-bold tracking-tight">
        Galeria de componentes
      </h1>
      <section aria-labelledby="sobre-fundo" className="flex flex-col gap-3">
        <h2 id="sobre-fundo" className="text-headline font-semibold">
          Sobre o fundo
        </h2>
        <Samples />
      </section>
      <section aria-labelledby="inicio" className="flex flex-col gap-6">
        <h2 id="inicio" className="text-headline font-semibold">
          Início
        </h2>
        <div className="flex flex-wrap items-center gap-6">
          <ProgressRing value={0.42} label="Preparativos" />
          <BudgetDonut
            caption="Comprometido"
            total={6_200_000}
            slices={[
              { key: "1", name: "Buffet e bebidas", cents: 2_800_000 },
              { key: "2", name: "Espaço", cents: 1_800_000 },
              { key: "3", name: "Foto e vídeo", cents: 900_000 },
              { key: "4", name: "Decoração e flores", cents: 500_000 },
              { key: "5", name: "Música", cents: 200_000 },
            ]}
          />
        </div>
        <Journey
          steps={journey("2028-02-20", "2027-09-01")}
          open={{ "12m": 0, "6m": 4, "3m": 9 }}
        />
        <Milestones
          items={milestones({
            hasDate: true,
            hiredVendors: 2,
            listedHouseholds: 40,
            savedTheDate: 0,
            invitedHouseholds: 0,
            tasksDone: 10,
            tasksTotal: 45,
            confirmedGuests: 0,
            expectedGuests: 120,
            committed: 100,
            paid: 0,
          })}
        />
      </section>
      <section aria-labelledby="convidados" className="flex flex-col gap-3">
        <h2 id="convidados" className="text-headline font-semibold">
          Convidados
        </h2>
        <GuestSummary count={sampleCount} partnerA="Ana" partnerB="Bruno" />
      </section>
      <section
        aria-labelledby="sobre-card"
        className="flex flex-col gap-3 rounded-2xl bg-card p-4"
      >
        <h2 id="sobre-card" className="text-headline font-semibold">
          Sobre o card
        </h2>
        <Samples />
      </section>
      <section
        aria-labelledby="sobre-popover"
        className="flex flex-col gap-3 rounded-2xl bg-popover p-4 text-popover-foreground"
      >
        <h2 id="sobre-popover" className="text-headline font-semibold">
          Sobre avisos
        </h2>
        <Samples />
      </section>
    </main>
  );
}
