"use client";

import { useEffect, useState } from "react";
import { useToday } from "@/hooks/use-today";
import { m } from "@/lib/i18n";
import { currentItem, type TimelineRow } from "@/lib/timeline";

function clock() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

export function NowMarker({
  weddingDate,
  items,
  id,
}: {
  weddingDate: string | null;
  items: TimelineRow[];
  id: string;
}) {
  const today = useToday();
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    setTime(clock());
    const timer = window.setInterval(() => setTime(clock()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  if (!time || today !== weddingDate || currentItem(items, time)?.id !== id)
    return null;
  return (
    <span className="rounded-full bg-primary px-2 py-0.5 text-caption2 font-bold text-primary-foreground">
      {m.timeline.now}
    </span>
  );
}
