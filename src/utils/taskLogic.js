import { diffDays, addDays } from './dates.js';

/** A completed task is never overdue. */
export function isOverdue(task, today) {
  return task.status !== 'completed' && task.due_date < today;
}

/** Which deadline group a task belongs to. */
export function deadlineBucket(task, today) {
  if (task.status === 'completed') return 'completed';
  const d = diffDays(task.due_date, today);
  if (d < 0) return 'overdue';
  if (d === 0) return 'today';
  if (d === 1) return 'tomorrow';
  if (d <= 7) return 'week';
  return 'later';
}

export const BUCKET_ORDER = ['overdue', 'today', 'tomorrow', 'week', 'later', 'completed'];
export const BUCKET_LABELS = {
  overdue: 'Overdue', today: 'Due today', tomorrow: 'Due tomorrow',
  week: 'Due within 7 days', later: 'Upcoming later', completed: 'Completed',
};

export function groupByBucket(tasks, today) {
  const groups = Object.fromEntries(BUCKET_ORDER.map((b) => [b, []]));
  for (const t of tasks) groups[deadlineBucket(t, today)].push(t);
  for (const b of BUCKET_ORDER) groups[b].sort((a, c) => a.due_date.localeCompare(c.due_date));
  return groups;
}

/** completion % = completed / total * 100 (rounded). 0 when there are no tasks (no divide-by-zero). */
export function completionRate(tasks) {
  if (!tasks.length) return 0;
  return Math.round((tasks.filter((t) => t.status === 'completed').length / tasks.length) * 100);
}

export function computeStats(tasks, today) {
  const count = (fn) => tasks.filter(fn).length;
  return {
    total: tasks.length,
    todo: count((t) => t.status === 'todo'),
    inProgress: count((t) => t.status === 'in_progress'),
    completed: count((t) => t.status === 'completed'),
    overdue: count((t) => isOverdue(t, today)),
    dueToday: count((t) => t.status !== 'completed' && t.due_date === today),
    dueThisWeek: count((t) => t.status !== 'completed' && t.due_date >= today && t.due_date <= addDays(today, 7)),
    highPriorityOpen: count((t) => t.status !== 'completed' && t.priority === 'high'),
    completionRate: completionRate(tasks),
  };
}

/** Open tasks due today or later, soonest first. */
export function upcomingTasks(tasks, today, limit = 5) {
  return tasks
    .filter((t) => t.status !== 'completed' && t.due_date >= today)
    .sort((a, b) => a.due_date.localeCompare(b.due_date))
    .slice(0, limit);
}
