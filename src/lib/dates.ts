import { format, formatDistanceToNow, isPast, isToday, isTomorrow } from "date-fns";

export function formatDate(date: Date | string | null | undefined) {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "MMM d, yyyy");
}

export function formatDateShort(date: Date | string | null | undefined) {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "MMM d");
}

export function formatDateTime(date: Date | string | null | undefined) {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "MMM d, yyyy 'at' h:mm a");
}

export function fromNow(date: Date | string | null | undefined) {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

export function friendlyDate(date: Date | string | null | undefined) {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isToday(d)) return "Today";
  if (isTomorrow(d)) return "Tomorrow";
  return format(d, "EEE, MMM d");
}

export function isOverdue(date: Date | string | null | undefined) {
  if (!date) return false;
  const d = typeof date === "string" ? new Date(date) : date;
  return isPast(d) && !isToday(d);
}

export function daysBetween(
  a: Date | string | null | undefined,
  b: Date | string | null | undefined
): number | null {
  if (!a || !b) return null;
  const dA = typeof a === "string" ? new Date(a) : a;
  const dB = typeof b === "string" ? new Date(b) : b;
  const diffMs = dB.getTime() - dA.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}
