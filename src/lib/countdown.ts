export interface CountdownParts {
  years: number;
  months: number;
  weeks: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function breakdown(target: Date, now: Date): CountdownParts | null {
  if (target.getTime() <= now.getTime()) return null;
  let years = target.getFullYear() - now.getFullYear();
  const cursor = new Date(now);
  cursor.setFullYear(cursor.getFullYear() + years);
  if (cursor.getTime() > target.getTime()) {
    years -= 1;
    cursor.setFullYear(now.getFullYear() + years);
  }
  let months = 0;
  for (;;) {
    const t = new Date(cursor);
    t.setMonth(t.getMonth() + 1);
    if (t.getTime() <= target.getTime()) {
      cursor.setTime(t.getTime());
      months += 1;
    } else break;
  }
  let ms = target.getTime() - cursor.getTime();
  const S = 1000,
    M = 60 * S,
    H = 60 * M,
    D = 24 * H,
    W = 7 * D;
  const weeks = Math.floor(ms / W);
  ms -= weeks * W;
  const days = Math.floor(ms / D);
  ms -= days * D;
  const hours = Math.floor(ms / H);
  ms -= hours * H;
  const minutes = Math.floor(ms / M);
  ms -= minutes * M;
  const seconds = Math.floor(ms / S);
  return { years, months, weeks, days, hours, minutes, seconds };
}

export function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

export function formatDateTimeLocal(value: string): string {
  if (!value) return "";
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    });
  } catch {
    return value;
  }
}
