"use client";

import NumberFlow from "@number-flow/react";
import { useEffect, useState } from "react";

export function Countdown({ days }: { days: number }) {
  const [value, setValue] = useState(0);
  useEffect(() => setValue(days), [days]);

  return (
    <span className="tabular-nums">
      <span className="sr-only">{days.toLocaleString("pt-BR")}</span>
      <NumberFlow aria-hidden="true" value={value} locales="pt-BR" />
    </span>
  );
}
