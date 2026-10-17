import { PRIORITY_RANK } from '../config/constants.js';

/** Filters: { search, status, priority, subject, type }. Empty / 'all' means "no filter". */
export function filterTasks(tasks, f = {}) {
  const q = (f.search || '').trim().toLowerCase();
  return tasks.filter((t) => {
    if (f.status && f.status !== 'all' && t.status !== f.status) return false;
    if (f.priority && f.priority !== 'all' && t.priority !== f.priority) return false;
    if (f.subject && f.subject !== 'all' && t.subject !== f.subject) return false;
    if (f.type && f.type !== 'all' && t.task_type !== f.type) return false;
    if (q) {
      const hay = `${t.title} ${t.description || ''} ${t.subject}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

/** sortKey: due_asc | due_desc | priority_desc | created_desc. Returns a new array. */
export function sortTasks(tasks, sortKey = 'due_asc') {
  const arr = [...tasks];
  const byDue = (a, b) => a.due_date.localeCompare(b.due_date);
  switch (sortKey) {
    case 'due_desc': return arr.sort((a, b) => byDue(b, a));
    case 'priority_desc':
      return arr.sort((a, b) => PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority] || byDue(a, b));
    case 'created_desc':
      return arr.sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
    default: return arr.sort(byDue);
  }
}

export const uniqueSubjects = (tasks) => [...new Set(tasks.map((t) => t.subject))].sort((a, b) => a.localeCompare(b));
