"use client";

import {
  CheckIcon,
  HeartIcon,
  PartyPopperIcon,
  ThumbsDownIcon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { setHouseholdList } from "@/lib/actions/guests";
import { attempt, failed } from "@/lib/attempt";
import { m } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type Card = { id: string; name: string; members: string[] };
type Decision = "a" | "b" | "out";

const threshold = 110;

export function Triage({ cards }: { cards: Card[] }) {
  const [queue, setQueue] = useState(cards);
  const [answers, setAnswers] = useState<boolean[]>([
    false,
    false,
    false,
    false,
  ]);
  const [dx, setDx] = useState(0);
  const [leaving, setLeaving] = useState<Decision | null>(null);
  const [, startTransition] = useTransition();
  const start = useRef<number | null>(null);
  const [total] = useState(cards.length);
  const current = queue[0];
  const score = answers.filter(Boolean).length;
  const suggestion: Decision = score >= 3 ? "a" : score === 2 ? "b" : "out";

  const decide = useCallback(
    (decision: Decision) => {
      if (!current || leaving) return;
      setLeaving(decision);
      window.setTimeout(() => {
        setQueue((items) => items.slice(1));
        setAnswers([false, false, false, false]);
        setDx(0);
        setLeaving(null);
      }, 220);
      startTransition(async () => {
        const result = await attempt(
          setHouseholdList(current.id, decision),
          failed,
        );
        if (!result.ok) {
          toast.add({
            title: result.message ?? m.common.tryAgain,
            type: "error",
          });
          setQueue((items) => [...items, current]);
          return;
        }
        toast.add({
          title: m.triage.decided(
            current.name,
            decision === "out" ? m.triage.toOut : m.lists[decision],
          ),
        });
      });
    },
    [current, leaving],
  );

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (
        event.target instanceof HTMLElement &&
        ["INPUT", "TEXTAREA", "SELECT"].includes(event.target.tagName)
      )
        return;
      const key = event.key.toLowerCase();
      if (key === "a") decide("a");
      if (key === "b") decide("b");
      if (key === "n") decide("out");
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [decide]);

  if (!current) {
    return (
      <section className="flex animate-step-in flex-col items-center gap-4 rounded-3xl bg-card px-6 py-12 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-blush text-link">
          <PartyPopperIcon aria-hidden="true" className="size-7" />
        </span>
        <h2 className="font-display text-title1 font-bold tracking-tight">
          {total ? m.triage.doneTitle : m.triage.empty}
        </h2>
        {total > 0 && (
          <p className="max-w-sm text-subhead text-muted-foreground">
            {m.triage.doneDescription}
          </p>
        )}
        <Link href="/convidados" className={buttonVariants({ size: "lg" })}>
          {m.guests.title}
        </Link>
      </section>
    );
  }

  const offset = leaving
    ? leaving === "out"
      ? -480
      : leaving === "a"
        ? 480
        : 0
    : dx;
  const lift = leaving === "b" ? -40 : 0;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between text-subhead">
        <span className="text-muted-foreground">{m.triage.intro}</span>
        <span className="font-semibold tabular-nums">
          {m.triage.progress(total - queue.length + 1, total)}
        </span>
      </div>
      <div
        aria-hidden="true"
        className="h-1.5 overflow-hidden rounded-full bg-muted"
      >
        <div
          className="h-full rounded-full bg-primary transition-[width]"
          style={{ width: `${((total - queue.length) / total) * 100}%` }}
        />
      </div>

      <div className="relative">
        {queue[1] && (
          <div
            aria-hidden="true"
            className="absolute inset-x-4 top-3 h-full rounded-3xl bg-card/70 shadow-sm"
          />
        )}
        <p className="sr-only" aria-live="polite">
          {current.name}
        </p>
        <article
          onPointerDown={(event) => {
            if ((event.target as HTMLElement).closest("button,label")) return;
            start.current = event.clientX;
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerMove={(event) => {
            if (start.current !== null) setDx(event.clientX - start.current);
          }}
          onPointerUp={() => {
            const moved = dx;
            start.current = null;
            if (moved > threshold) decide("a");
            else if (moved < -threshold) decide("out");
            else setDx(0);
          }}
          onPointerCancel={() => {
            start.current = null;
            setDx(0);
          }}
          className={cn(
            "relative flex touch-pan-y flex-col gap-5 rounded-3xl bg-card p-6 shadow-md select-none",
            start.current === null &&
              "transition-[transform,opacity] duration-200",
            leaving && "opacity-0",
          )}
          style={{
            transform: `translate(${offset}px, ${lift}px) rotate(${offset / 22}deg)`,
          }}
        >
          <span
            aria-hidden="true"
            className={cn(
              "absolute top-5 right-5 rounded-full px-3 py-1 text-footnote font-bold transition-opacity",
              dx > 30
                ? "bg-success text-card opacity-100"
                : dx < -30
                  ? "bg-danger text-card opacity-100"
                  : "opacity-0",
            )}
          >
            {dx > 0 ? m.triage.toA : m.triage.toOut}
          </span>
          <div className="flex flex-col gap-2">
            <span className="flex size-12 items-center justify-center rounded-full bg-blush text-link">
              <UsersIcon aria-hidden="true" className="size-6" />
            </span>
            <h2 className="font-display text-title1 font-bold tracking-tight text-balance">
              {current.name}
            </h2>
            {current.members.length > 1 && (
              <p className="text-subhead text-muted-foreground">
                {current.members.join(", ")}
              </p>
            )}
          </div>
          <fieldset className="flex flex-col gap-1">
            <legend className="sr-only">{m.triage.title}</legend>
            {m.triage.questions.map((question, index) => (
              <label
                key={question}
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl px-2 text-body hover:bg-muted/60"
              >
                <input
                  type="checkbox"
                  checked={answers[index]}
                  onChange={(event) =>
                    setAnswers((current) =>
                      current.map((value, i) =>
                        i === index ? event.target.checked : value,
                      ),
                    )
                  }
                  className="peer sr-only"
                />
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full border-2 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring",
                    answers[index]
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input",
                  )}
                >
                  {answers[index] && (
                    <HeartIcon className="size-3.5 fill-current" />
                  )}
                </span>
                {question}
              </label>
            ))}
          </fieldset>
        </article>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {(
          [
            ["out", m.triage.toOut, ThumbsDownIcon, "secondary"],
            ["b", m.triage.toB, UsersIcon, "secondary"],
            ["a", m.triage.toA, CheckIcon, "default"],
          ] as const
        ).map(([decision, label, Icon, variant]) => (
          <Button
            key={decision}
            size="lg"
            variant={variant}
            onClick={() => decide(decision)}
            className={cn(
              "h-14 flex-col gap-0.5 text-footnote",
              suggestion === decision &&
                score > 0 &&
                "ring-2 ring-primary ring-offset-2 ring-offset-background",
            )}
          >
            <Icon aria-hidden="true" className="size-5" />
            {label}
          </Button>
        ))}
      </div>
      <p className="text-center text-footnote text-muted-foreground">
        <span className="hidden md:inline">{m.triage.keys}</span>
        <span className="md:hidden">{m.triage.swipeHint}</span>
      </p>
    </div>
  );
}
