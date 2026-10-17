import { daysInMonth, toISO, addDays, weekdayIndex, parseISO } from './dates.js';

/** Move (year, month 1-12) forward/backward by delta months, crossing year boundaries correctly. */
export function shiftMonth(y, m, delta) {
  const idx = y * 12 + (m - 1) + delta;
  return { y: Math.floor(idx / 12), m: (idx % 12) + 1 };
}

/** Cells for a Sunday-first month grid. Includes leading/trailing days of neighbouring months. */
export function buildMonthGrid(y, m) {
  const first = toISO(y, m, 1);
  const lead = weekdayIndex(first);
  const total = Math.ceil((lead + daysInMonth(y, m)) / 7) * 7;
  const start = addDays(first, -lead);
  return Array.from({ length: total }, (_, i) => {
    const iso = addDays(start, i);
    const p = parseISO(iso);
    return { iso, day: p.d, inMonth: p.y === y && p.m === m };
  });
}

/** Map of due_date -> tasks[] for fast lookup inside the calendar. */
export function groupTasksByDate(tasks) {
  const map = {};
  for (const t of tasks) (map[t.due_date] ||= []).push(t);
  return map;
}
