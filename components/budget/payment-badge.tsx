import {
  CalendarClockIcon,
  CircleAlertIcon,
  CircleCheckIcon,
  ClockIcon,
} from "lucide-react";
import { StatusBadge, type Tone } from "@/components/ui/status-badge";
import type { PaymentState } from "@/lib/budget";
import { m } from "@/lib/i18n";

const look: Record<PaymentState, { icon: typeof ClockIcon; tone: Tone }> = {
  paid: { icon: CircleCheckIcon, tone: "success" },
  overdue: { icon: CircleAlertIcon, tone: "danger" },
  soon: { icon: ClockIcon, tone: "warning" },
  later: { icon: CalendarClockIcon, tone: "muted" },
};

export function PaymentBadge({
  state,
  label,
}: {
  state: PaymentState;
  label?: string;
}) {
  const { icon, tone } = look[state];
  return (
    <StatusBadge icon={icon} tone={tone}>
      {label ?? m.budget.states[state]}
    </StatusBadge>
  );
}
