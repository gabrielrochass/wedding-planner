"use client";

import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Rings } from "@/components/brand/rings";
import { Button } from "@/components/ui/button";
import { markTourSeen } from "@/lib/actions/tours";
import { m } from "@/lib/i18n";
import {
  type Box,
  popupPlacement,
  type TourId,
  tourForPath,
  tourToOpen,
} from "@/lib/tour";
import { cn } from "@/lib/utils";

type TourStep = {
  readonly target?: string;
  readonly title: string;
  readonly text: readonly string[];
};

const padding = 8;

function findTarget(target: string | undefined) {
  if (!target) return undefined;
  return Array.from(
    document.querySelectorAll<HTMLElement>(`[data-tour="${target}"]`),
  ).find((element) => element.getClientRects().length > 0);
}

function boxOf(element: HTMLElement): Box {
  const rect = element.getBoundingClientRect();
  return {
    top: rect.top - padding,
    left: rect.left - padding,
    width: rect.width + padding * 2,
    height: rect.height + padding * 2,
  };
}

export function Tour({ seen }: { seen: readonly string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const requested = searchParams.get("tour");
  const [done, setDone] = useState<readonly string[]>(seen);
  const seenKey = seen.join(",");
  const [tour, setTour] = useState<TourId | null>(null);
  const [steps, setSteps] = useState<TourStep[]>([]);
  const [index, setIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const [box, setBox] = useState<Box | null>(null);
  const [popupSize, setPopupSize] = useState({ width: 352, height: 240 });
  const rootRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const primaryRef = useRef<HTMLButtonElement>(null);
  const handledRequest = useRef<string | null>(null);
  const titleId = useId();
  const textId = useId();

  useEffect(() => {
    setDone(seenKey ? seenKey.split(",") : []);
  }, [seenKey]);

  const start = useCallback((id: TourId) => {
    const all: readonly TourStep[] = m.tours[id].steps;
    const found = all.filter((step) => !step.target || findTarget(step.target));
    setSteps(found);
    setIndex(0);
    setFinished(false);
    setTour(id);
  }, []);

  useEffect(() => {
    const request = requested ? `${pathname}?${requested}` : null;
    if (!request) handledRequest.current = null;
    else if (handledRequest.current === request) return;
    const id = tourToOpen(pathname, done, requested);
    if (!id) return;
    const timer = window.setTimeout(() => {
      handledRequest.current = request;
      start(id);
    }, 400);
    return () => window.clearTimeout(timer);
  }, [pathname, requested, done, start]);

  const step = tour && !finished ? steps[index] : undefined;

  const measure = useCallback(() => {
    const target = findTarget(step?.target);
    setBox(target ? boxOf(target) : null);
  }, [step]);

  useLayoutEffect(() => {
    if (!step) return;
    bodyRef.current?.scrollTo({ top: 0 });
    const target = findTarget(step.target);
    if (target) {
      const rect = target.getBoundingClientRect();
      const room = 2 * (padding + 16);
      const fitsBelow =
        window.innerHeight - rect.bottom - room >= popupSize.height;
      const fitsAbove = rect.top - room >= popupSize.height;
      const visible = rect.top >= 0 && rect.bottom <= window.innerHeight;
      if (!visible || (!fitsBelow && !fitsAbove)) {
        window.scrollBy({ top: rect.top - room });
      }
    }
    measure();
  }, [step, measure, popupSize.height]);

  useEffect(() => {
    if (!tour) return;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [tour, measure]);

  useLayoutEffect(() => {
    if (!tour || !popupRef.current) return;
    const { offsetWidth, offsetHeight } = popupRef.current;
    setPopupSize((current) =>
      current.width === offsetWidth && current.height === offsetHeight
        ? current
        : { width: offsetWidth, height: offsetHeight },
    );
  });

  useEffect(() => {
    if (!tour) return;
    const root = rootRef.current;
    const others = Array.from(document.body.children).filter(
      (element) => element !== root && !element.hasAttribute("inert"),
    );
    for (const element of others) element.setAttribute("inert", "");
    return () => {
      for (const element of others) element.removeAttribute("inert");
    };
  }, [tour]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: refocus the main button on every step
  useEffect(() => {
    if (tour) primaryRef.current?.focus();
  }, [tour, index, finished]);

  useEffect(() => {
    if (!tour) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      } else if (!finished && event.key === "ArrowRight") {
        go(1);
      } else if (!finished && event.key === "ArrowLeft") {
        go(-1);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  });

  function go(delta: number) {
    const next = index + delta;
    if (next < 0) return;
    if (next >= steps.length) setFinished(true);
    else setIndex(next);
  }

  function remember(id: TourId) {
    setDone((current) => (current.includes(id) ? current : [...current, id]));
    void markTourSeen(id);
  }

  function close() {
    if (tour) remember(tour);
    setTour(null);
    setBox(null);
    if (requested) router.replace(pathname as Route, { scroll: false });
  }

  const page = tourForPath(pathname);
  const chainTo =
    tour === "geral" && page && !done.includes(page) ? page : null;

  function continueWithPage() {
    if (!chainTo || !tour) return;
    remember(tour);
    window.scrollTo({ top: 0 });
    start(chainTo);
  }

  if (!tour) return null;

  const viewport = {
    width: document.documentElement.clientWidth,
    height: window.innerHeight,
  };
  const placement =
    step && box ? popupPlacement(box, viewport, popupSize) : null;
  const content = m.tours[tour];
  const paragraphs = step?.text ?? [];

  return createPortal(
    <div ref={rootRef} className="fixed inset-0 z-45">
      {placement && box ? (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed rounded-2xl shadow-[0_0_0_9999px_rgb(0_0_0/0.62)] outline-2 outline-offset-0 outline-ring transition-[top,left,width,height] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
          style={{
            top: box.top,
            left: box.left,
            width: box.width,
            height: box.height,
          }}
        />
      ) : (
        <div aria-hidden="true" className="fixed inset-0 bg-black/62" />
      )}

      <div
        ref={popupRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={textId}
        className={cn(
          "fixed flex max-h-[calc(100dvh-2rem)] w-[min(22rem,calc(100vw-2rem))] flex-col gap-3 rounded-2xl bg-popover p-5 text-popover-foreground shadow-xl transition-[top,left] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
          !placement && "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
        )}
        style={placement ? { top: placement.top, left: placement.left } : {}}
      >
        {step ? (
          <>
            <p className="text-footnote font-medium text-link tabular-nums">
              {m.tour.step(content.label, index + 1, steps.length)}
            </p>
            <h2 id={titleId} className="text-headline font-semibold">
              {step.title}
            </h2>
            <div
              ref={bodyRef}
              id={textId}
              // biome-ignore lint/a11y/noNoninteractiveTabindex: long text scrolls and must be reachable by keyboard
              tabIndex={0}
              className="-mr-2 flex max-h-[min(42dvh,22rem)] flex-col gap-2 overflow-y-auto pr-2 text-subhead text-muted-foreground"
            >
              {paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <div className="mt-1 flex items-center justify-between gap-2">
              <Button
                variant="ghost"
                size="lg"
                className="-ml-3 text-muted-foreground"
                onClick={close}
              >
                {m.tour.skip}
              </Button>
              <div className="flex gap-2">
                {index > 0 && (
                  <Button
                    variant="secondary"
                    size="icon-lg"
                    aria-label={m.tour.back}
                    onClick={() => go(-1)}
                  >
                    <ArrowLeftIcon aria-hidden="true" />
                  </Button>
                )}
                <Button ref={primaryRef} size="lg" onClick={() => go(1)}>
                  {index === steps.length - 1 ? m.tour.finish : m.tour.next}
                  <ArrowRightIcon aria-hidden="true" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            <Rings className="h-10 w-16" />
            <h2 id={titleId} className="text-title3 font-semibold">
              {content.doneTitle}
            </h2>
            <p id={textId} className="text-subhead text-muted-foreground">
              {content.doneText}
            </p>
            <div className="mt-2 flex flex-col gap-2">
              {chainTo && (
                <Button ref={primaryRef} size="lg" onClick={continueWithPage}>
                  {m.tour.continueWith(m.tours[chainTo].label)}
                </Button>
              )}
              <Button
                ref={chainTo ? undefined : primaryRef}
                variant={chainTo ? "ghost" : "default"}
                size="lg"
                onClick={close}
              >
                {m.tour.close}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
