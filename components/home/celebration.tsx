"use client";

import { useEffect, useState } from "react";
import { toast } from "@/components/ui/toast";
import { m } from "@/lib/i18n";
import type { MilestoneKey } from "@/lib/wedding";

const colors = [
  "var(--primary)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-5)",
  "var(--link)",
];

type Piece = {
  left: number;
  delay: number;
  duration: number;
  drift: number;
  spin: number;
  color: string;
};

function burst(): Piece[] {
  return Array.from({ length: 48 }, (_, index) => ({
    left: Math.random() * 100,
    delay: Math.random() * 0.6,
    duration: 2.2 + Math.random() * 1.4,
    drift: (Math.random() - 0.5) * 30,
    spin: (Math.random() - 0.5) * 1080,
    color: colors[index % colors.length],
  }));
}

function read(key: string) {
  try {
    const value = window.localStorage.getItem(key);
    return value === null ? null : (JSON.parse(value) as string[]);
  } catch {
    return null;
  }
}

function write(key: string, value: string[]) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export function Celebration({
  weddingId,
  reached,
}: {
  weddingId: string;
  reached: readonly MilestoneKey[];
}) {
  const [pieces, setPieces] = useState<Piece[]>([]);
  const signature = reached.join(",");

  useEffect(() => {
    const key = `doisemum:conquistas:${weddingId}`;
    const keys = signature ? (signature.split(",") as MilestoneKey[]) : [];
    const seen = read(key);
    write(key, keys);
    if (seen === null) return;
    const fresh = keys.filter((item) => !seen.includes(item));
    if (fresh.length === 0) return;
    toast.add({
      title: m.milestones.celebrate(m.milestones[fresh[0]]),
      type: "success",
    });
    setPieces(burst());
    const timer = window.setTimeout(() => setPieces([]), 4000);
    return () => window.clearTimeout(timer);
  }, [weddingId, signature]);

  if (pieces.length === 0) return null;
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
    >
      {pieces.map((piece, index) => (
        <span
          // biome-ignore lint/suspicious/noArrayIndexKey: pieces never reorder
          key={index}
          className="confetti-piece"
          style={
            {
              left: `${piece.left}%`,
              background: piece.color,
              "--delay": `${piece.delay}s`,
              "--duration": `${piece.duration}s`,
              "--drift": `${piece.drift}vw`,
              "--spin": `${piece.spin}deg`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
