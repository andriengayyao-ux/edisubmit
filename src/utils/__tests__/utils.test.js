import { describe, it, expect } from 'vitest';
import { daysInMonth, addDays, diffDays, startOfWeek, parseISO, todayISO, toISO } from '../dates.js';
import { shiftMonth, buildMonthGrid, groupTasksByDate } from '../calendar.js';
import { computeStats, isOverdue, deadlineBucket, groupByBucket, completionRate, upcomingTasks } from '../taskLogic.js';
import { filterTasks, sortTasks, uniqueSubjects } from '../filters.js';
import { validateTask, validateRegistration, validateLogin } from '../validation.js';
import { remainingSeconds, formatClock, clampMinutes } from '../timer.js';
import { summarizeWeek, weekDays, unscheduledTasks } from '../planner.js';
import { countBy, weeklyCompletions } from '../analytics.js';

const TODAY = '2026-10-17';
const mk = (o = {}) => ({
  id: Math.random().toString(36).slice(2), title: 'Task', description: '', subject: 'Math',
  task_type: 'Assignment', priority: 'medium', status: 'todo', due_date: TODAY,
  created_at: '2026-10-01T00:00:00Z', ...o,
});

describe('dashboard statistics', () => {
  it('handles zero tasks without dividing by zero', () => {
    const s = computeStats([], TODAY);
    expect(s).toMatchObject({ total: 0, todo: 0, inProgress: 0, completed: 0, overdue: 0, completionRate: 0 });
  });
  it('counts statuses and completion rate', () => {
    const tasks = [mk({ status: 'todo' }), mk({ status: 'in_progress' }), mk({ status: 'completed' }), mk({ status: 'completed' })];
    const s = computeStats(tasks, TODAY);
    expect(s).toMatchObject({ total: 4, todo: 1, inProgress: 1, completed: 2, completionRate: 50 });
  });
  it('completionRate rounds', () => {
    expect(completionRate([mk({ status: 'completed' }), mk(), mk()])).toBe(33);
  });
  it('counts high-priority open tasks only', () => {
    const s = computeStats([mk({ priority: 'high' }), mk({ priority: 'high', status: 'completed' })], TODAY);
    expect(s.highPriorityOpen).toBe(1);
  });
});

describe('overdue and deadline logic', () => {
  it('past due open task is overdue', () => {
    expect(isOverdue(mk({ due_date: '2026-10-16' }), TODAY)).toBe(true);
  });
  it('a completed task is never overdue', () => {
    expect(isOverdue(mk({ due_date: '2020-01-01', status: 'completed' }), TODAY)).toBe(false);
    expect(computeStats([mk({ due_date: '2020-01-01', status: 'completed' })], TODAY).overdue).toBe(0);
  });
  it('task due today is not overdue', () => {
    expect(isOverdue(mk({ due_date: TODAY }), TODAY)).toBe(false);
  });
  it('buckets: today, tomorrow, within 7 days, later, overdue, completed', () => {
    expect(deadlineBucket(mk({ due_date: TODAY }), TODAY)).toBe('today');
    expect(deadlineBucket(mk({ due_date: '2026-10-18' }), TODAY)).toBe('tomorrow');
    expect(deadlineBucket(mk({ due_date: '2026-10-24' }), TODAY)).toBe('week'); // exactly +7
    expect(deadlineBucket(mk({ due_date: '2026-10-25' }), TODAY)).toBe('later'); // +8
    expect(deadlineBucket(mk({ due_date: '2026-10-10' }), TODAY)).toBe('overdue');
    expect(deadlineBucket(mk({ status: 'completed', due_date: '2026-10-10' }), TODAY)).toBe('completed');
  });
  it('groupByBucket sorts each group by due date', () => {
    const g = groupByBucket([mk({ due_date: '2026-10-22' }), mk({ due_date: '2026-10-20' })], TODAY);
    expect(g.week.map((t) => t.due_date)).toEqual(['2026-10-20', '2026-10-22']);
  });
  it('upcomingTasks skips completed and past tasks', () => {
    const list = upcomingTasks([mk({ due_date: '2026-10-20' }), mk({ due_date: '2026-10-01' }), mk({ status: 'completed', due_date: '2026-10-19' })], TODAY);
    expect(list).toHaveLength(1);
  });
});

describe('dates and calendar', () => {
  it('knows month lengths and leap years', () => {
    expect(daysInMonth(2026, 2)).toBe(28);
    expect(daysInMonth(2028, 2)).toBe(29);
    expect(daysInMonth(1900, 2)).toBe(28);
    expect(daysInMonth(2000, 2)).toBe(29);
    expect(daysInMonth(2026, 4)).toBe(30);
    expect(daysInMonth(2026, 12)).toBe(31);
  });
  it('rejects impossible dates', () => {
    expect(parseISO('2026-02-30')).toBeNull();
    expect(parseISO('2026-13-01')).toBeNull();
    expect(parseISO('hello')).toBeNull();
  });
  it('navigates months across year boundaries', () => {
    expect(shiftMonth(2026, 12, 1)).toEqual({ y: 2027, m: 1 });
    expect(shiftMonth(2026, 1, -1)).toEqual({ y: 2025, m: 12 });
    expect(shiftMonth(2026, 10, 3)).toEqual({ y: 2027, m: 1 });
    expect(shiftMonth(2026, 3, -15)).toEqual({ y: 2024, m: 12 });
  });
  it('adds days across month/year/leap boundaries', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2028-02-28', 1)).toBe('2028-02-29');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
    expect(diffDays('2026-10-25', '2026-10-17')).toBe(8);
  });
  it('todayISO uses local calendar date', () => {
    expect(todayISO(new Date(2026, 9, 17, 23, 59))).toBe('2026-10-17');
    expect(toISO(2026, 1, 5)).toBe('2026-01-05');
  });
  it('builds a month grid with correct size and first/last cells', () => {
    const g = buildMonthGrid(2026, 10); // Oct 1, 2026 is a Thursday
    expect(g.length % 7).toBe(0);
    expect(g[0].iso).toBe('2026-09-27');
    expect(g.find((c) => c.iso === '2026-10-01').inMonth).toBe(true);
    expect(g.filter((c) => c.inMonth)).toHaveLength(31);
    expect(buildMonthGrid(2026, 2).filter((c) => c.inMonth)).toHaveLength(28);
    expect(buildMonthGrid(2028, 2).filter((c) => c.inMonth)).toHaveLength(29);
  });
  it('groups tasks by due date', () => {
    const m = groupTasksByDate([mk({ due_date: '2026-10-20' }), mk({ due_date: '2026-10-20' }), mk({ due_date: '2026-10-21' })]);
    expect(m['2026-10-20']).toHaveLength(2);
  });
  it('startOfWeek returns Monday', () => {
    expect(startOfWeek('2026-10-17')).toBe('2026-10-12'); // Saturday -> Monday
    expect(startOfWeek('2026-10-12')).toBe('2026-10-12');
    expect(startOfWeek('2026-10-18')).toBe('2026-10-12'); // Sunday belongs to the week before
  });
});

describe('search, filter, sort', () => {
  const tasks = [
    mk({ title: 'Essay on AI', subject: 'English', priority: 'high', due_date: '2026-10-20', created_at: '2026-10-02T00:00:00Z' }),
    mk({ title: 'Quiz review', subject: 'Math', task_type: 'Quiz', priority: 'low', due_date: '2026-10-18', created_at: '2026-10-03T00:00:00Z', description: 'Chapter 3 formulas' }),
    mk({ title: 'Lab report', subject: 'Science', status: 'completed', priority: 'medium', due_date: '2026-10-25', created_at: '2026-10-01T00:00:00Z' }),
  ];
  it('searches title, description and subject, case-insensitively', () => {
    expect(filterTasks(tasks, { search: 'ESSAY' })).toHaveLength(1);
    expect(filterTasks(tasks, { search: 'formulas' })).toHaveLength(1);
    expect(filterTasks(tasks, { search: 'science' })).toHaveLength(1);
    expect(filterTasks(tasks, { search: 'zzz' })).toHaveLength(0);
  });
  it('filters by status, priority, subject, type', () => {
    expect(filterTasks(tasks, { status: 'completed' })).toHaveLength(1);
    expect(filterTasks(tasks, { priority: 'high' })).toHaveLength(1);
    expect(filterTasks(tasks, { subject: 'Math' })).toHaveLength(1);
    expect(filterTasks(tasks, { type: 'Quiz' })).toHaveLength(1);
    expect(filterTasks(tasks, { status: 'all', priority: 'all' })).toHaveLength(3);
  });
  it('sorts by due date, priority and created date without mutating input', () => {
    const copy = [...tasks];
    expect(sortTasks(tasks, 'due_asc').map((t) => t.subject)).toEqual(['Math', 'English', 'Science']);
    expect(sortTasks(tasks, 'due_desc')[0].subject).toBe('Science');
    expect(sortTasks(tasks, 'priority_desc').map((t) => t.priority)).toEqual(['high', 'medium', 'low']);
    expect(sortTasks(tasks, 'created_desc')[0].subject).toBe('Math');
    expect(tasks).toEqual(copy);
  });
  it('lists unique subjects alphabetically', () => {
    expect(uniqueSubjects(tasks)).toEqual(['English', 'Math', 'Science']);
  });
});

describe('form validation', () => {
  const ok = { title: 'Essay', subject: 'English', task_type: 'Assignment', priority: 'low', status: 'todo', due_date: '2026-10-20', description: '', estimated_minutes: '' };
  it('accepts a valid task', () => { expect(validateTask(ok)).toEqual({}); });
  it('requires title, subject and due date', () => {
    const e = validateTask({ ...ok, title: '  ', subject: '', due_date: '' });
    expect(e.title).toBeTruthy(); expect(e.subject).toBeTruthy(); expect(e.due_date).toBeTruthy();
  });
  it('rejects invalid enum values, impossible dates and bad estimates', () => {
    expect(validateTask({ ...ok, priority: 'urgent' }).priority).toBeTruthy();
    expect(validateTask({ ...ok, due_date: '2026-02-30' }).due_date).toBeTruthy();
    expect(validateTask({ ...ok, estimated_minutes: '2' }).estimated_minutes).toBeTruthy();
    expect(validateTask({ ...ok, estimated_minutes: '45' })).toEqual({});
    expect(validateTask({ ...ok, title: 'x'.repeat(121) }).title).toBeTruthy();
  });
  it('registration is blocked unless the privacy box is checked', () => {
    const base = { email: 'a@b.co', password: 'password1', confirmPassword: 'password1' };
    expect(validateRegistration({ ...base, agreed: false }).agreed).toBeTruthy();
    expect(validateRegistration({ ...base, agreed: undefined }).agreed).toBeTruthy();
    expect(validateRegistration({ ...base, agreed: true })).toEqual({});
  });
  it('registration checks email, password length and confirmation', () => {
    const e = validateRegistration({ email: 'nope', password: 'short', confirmPassword: 'other', agreed: true });
    expect(e.email && e.password && e.confirmPassword).toBeTruthy();
  });
  it('login validation', () => {
    expect(validateLogin({ email: 'a@b.co', password: 'x' })).toEqual({});
    expect(validateLogin({ email: '', password: '' })).toMatchObject({ email: expect.any(String), password: expect.any(String) });
  });
});

describe('focus timer maths', () => {
  it('computes remaining seconds from an end timestamp (works after the tab sleeps)', () => {
    expect(remainingSeconds(10_000, 4_000)).toBe(6);
    expect(remainingSeconds(10_000, 3_500)).toBe(7); // rounds up partial seconds
    expect(remainingSeconds(10_000, 99_000)).toBe(0); // never negative
  });
  it('formats mm:ss', () => {
    expect(formatClock(1500)).toBe('25:00');
    expect(formatClock(65)).toBe('01:05');
    expect(formatClock(-3)).toBe('00:00');
  });
  it('clamps typed minutes', () => {
    expect(clampMinutes('500', 1, 180, 25)).toBe(180);
    expect(clampMinutes('0', 1, 180, 25)).toBe(1);
    expect(clampMinutes('abc', 1, 180, 25)).toBe(25);
    expect(clampMinutes('12.9', 1, 180, 25)).toBe(12);
  });
});

describe('planner and analytics', () => {
  it('summarizes planned minutes and flags overloaded days', () => {
    const days = weekDays('2026-10-12');
    expect(days).toHaveLength(7);
    const tasks = [
      mk({ planned_date: '2026-10-13', estimated_minutes: 200 }),
      mk({ planned_date: '2026-10-13', estimated_minutes: 60 }),
      mk({ planned_date: '2026-10-14', estimated_minutes: 30 }),
      mk({ planned_date: '2026-10-14', estimated_minutes: 500, status: 'completed' }),
    ];
    const w = summarizeWeek(tasks, days);
    expect(w[1]).toMatchObject({ minutes: 260, overloaded: true });
    expect(w[2]).toMatchObject({ minutes: 30, overloaded: false });
    expect(unscheduledTasks(tasks)).toHaveLength(0);
    expect(unscheduledTasks([mk()])).toHaveLength(1);
  });
  it('counts tasks by field', () => {
    expect(countBy([mk({ priority: 'high' }), mk({ priority: 'high' }), mk({ priority: 'low' })], 'priority')).toEqual({ high: 2, low: 1 });
  });
  it('buckets weekly completions using completed_at', () => {
    const noon = (iso) => `${iso}T12:00:00`; // local time, so the local date is unambiguous
    const tasks = [
      mk({ status: 'completed', completed_at: noon('2026-10-13') }),
      mk({ status: 'completed', completed_at: noon('2026-10-15') }),
      mk({ status: 'completed', completed_at: noon('2026-10-06') }),
      mk({ status: 'completed', completed_at: noon('2025-01-01') }), // outside window
      mk({ status: 'todo', completed_at: null }),
    ];
    const w = weeklyCompletions(tasks, TODAY, 3);
    expect(w.map((b) => b.start)).toEqual(['2026-09-28', '2026-10-05', '2026-10-12']);
    expect(w.map((b) => b.value)).toEqual([0, 1, 2]);
  });
});
