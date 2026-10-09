export type TimelineRow = {
  id: string;
  starts_at: string;
  ends_at: string | null;
};

export function minutes(time: string) {
  const [hours, mins] = time.split(":").map(Number);
  return hours * 60 + mins;
}

export function formatTime(time: string) {
  return time.slice(0, 5).replace(":", "h");
}

export function inTimeOrder<T extends TimelineRow>(items: readonly T[]) {
  return items.toSorted((a, b) => minutes(a.starts_at) - minutes(b.starts_at));
}

export function overlaps<T extends TimelineRow>(items: readonly T[]) {
  const ordered = inTimeOrder(items);
  const clashing = new Set<string>();
  for (let index = 1; index < ordered.length; index += 1) {
    const previous = ordered[index - 1];
    const end = previous.ends_at
      ? minutes(previous.ends_at)
      : minutes(previous.starts_at);
    if (minutes(ordered[index].starts_at) < end) {
      clashing.add(previous.id);
      clashing.add(ordered[index].id);
    }
  }
  return clashing;
}

export function currentItem<T extends TimelineRow>(
  items: readonly T[],
  now: string,
) {
  const at = minutes(now);
  const ordered = inTimeOrder(items);
  let current: T | null = null;
  for (const item of ordered) {
    if (minutes(item.starts_at) <= at) current = item;
  }
  return current;
}
