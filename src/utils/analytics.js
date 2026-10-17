import { startOfWeek, addDays, timestampToLocalISO } from './dates.js';

/** Count tasks per value of a field, e.g. countBy(tasks, 'task_type'). */
export function countBy(tasks, field) {
  const out = {};
  for (const t of tasks) out[t[field]] = (out[t[field]] || 0) + 1;
  return out;
}

/** Tasks completed per week for the last `weeks` weeks (Monday-start), oldest first. Uses completed_at. */
export function weeklyCompletions(tasks, today, weeks = 6) {
  const thisWeek = startOfWeek(today);
  const buckets = Array.from({ length: weeks }, (_, i) => ({ start: addDays(thisWeek, -7 * (weeks - 1 - i)), value: 0 }));
  for (const t of tasks) {
    if (t.status !== 'completed' || !t.completed_at) continue;
    const ws = startOfWeek(timestampToLocalISO(t.completed_at));
    const b = buckets.find((x) => x.start === ws);
    if (b) b.value += 1;
  }
  return buckets;
}
