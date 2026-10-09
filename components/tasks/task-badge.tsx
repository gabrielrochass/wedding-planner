import {
  CalendarClockIcon,
  CalendarOffIcon,
  CircleAlertIcon,
  CircleCheckIcon,
  ClockIcon,
} from "lucide-react";
import { StatusBadge, type Tone } from "@/components/ui/status-badge";
import type { TaskState } from "@/lib/checklist";
import { m } from "@/lib/i18n";

const look: Record<TaskState, { icon: typeof ClockIcon; tone: Tone }> = {
  done: { icon: CircleCheckIcon, tone: "success" },
  overdue: { icon: CircleAlertIcon, tone: "danger" },
  soon: { icon: ClockIcon, tone: "warning" },
  later: { icon: CalendarClockIcon, tone: "muted" },
  undated: { icon: CalendarOffIcon, tone: "muted" },
};

export function TaskBadge({
  state,
  label,
}: {
  state: TaskState;
  label?: string;
}) {
  const { icon, tone } = look[state];
  return (
    <StatusBadge icon={icon} tone={tone}>
      {label ?? m.tasks.states[state]}
    </StatusBadge>
  );
}
