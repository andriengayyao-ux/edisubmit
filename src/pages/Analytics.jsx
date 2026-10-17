import { useMemo } from 'react';
import { BarChart3 } from 'lucide-react';
import { useTasks } from '../contexts/TasksContext.jsx';
import { Spinner, ErrorBox, EmptyState, StatCard, BarList, ColumnChart } from '../components/ui.jsx';
import { computeStats } from '../utils/taskLogic.js';
import { countBy, weeklyCompletions } from '../utils/analytics.js';
import { todayISO, formatDate } from '../utils/dates.js';
import { PRIORITIES, PRIORITY_LABELS, TASK_TYPES } from '../config/constants.js';

export default function Analytics() {
  const { tasks, loading, error, reload } = useTasks();
  const today = todayISO();
  const stats = useMemo(() => computeStats(tasks, today), [tasks, today]);
  const weekly = useMemo(() => weeklyCompletions(tasks, today, 8).map((b) => ({ label: formatDate(b.start, false), value: b.value })), [tasks, today]);
  const byType = useMemo(() => { const c = countBy(tasks, 'task_type'); return TASK_TYPES.map((t) => ({ label: t, value: c[t] || 0 })).filter((x) => x.value); }, [tasks]);
  const byPriority = useMemo(() => { const c = countBy(tasks, 'priority'); return PRIORITIES.map((p) => ({ label: PRIORITY_LABELS[p], value: c[p] || 0 })); }, [tasks]);

  if (loading) return <Spinner label="Loading analytics…" />;
  if (error) return <ErrorBox message={error} onRetry={reload} />;
  if (!tasks.length) return (<><h1 className="mb-4 text-2xl font-extrabold sm:text-3xl">Analytics</h1><EmptyState icon={BarChart3} title="No data yet." text="Add and complete some tasks, then your numbers appear here." /></>);

  return (
    <>
      <h1 className="mb-4 text-2xl font-extrabold sm:text-3xl">Analytics</h1>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Completion rate" value={`${stats.completionRate}%`} hint="completed ÷ all tasks" tone="ok" />
        <StatCard label="Completed" value={stats.completed} />
        <StatCard label="Pending" value={stats.todo + stats.inProgress} hint="To Do + In Progress" />
        <StatCard label="Overdue" value={stats.overdue} hint="not completed, past due date" tone={stats.overdue ? 'danger' : 'default'} />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <section className="card" aria-labelledby="a1"><h2 id="a1" className="mb-3 font-bold">Tasks completed per week</h2><ColumnChart data={weekly} />
          <p className="mt-3 text-sm text-muted">Counted by completion date, weeks start on Monday: {weekly.map((w) => `${w.label}: ${w.value}`).join(' · ')}.</p></section>
        <section className="card" aria-labelledby="a2"><h2 id="a2" className="mb-3 font-bold">Tasks by type</h2><BarList items={byType} /></section>
        <section className="card" aria-labelledby="a3"><h2 id="a3" className="mb-3 font-bold">Tasks by priority</h2><BarList items={byPriority} /></section>
        <section className="card text-sm" aria-labelledby="a4"><h2 id="a4" className="mb-2 font-bold">How these are calculated</h2>
          <ul className="list-disc space-y-1 pl-5 text-muted"><li>Completion rate = completed tasks ÷ total tasks × 100, rounded (0 when you have no tasks).</li><li>Pending = tasks that are To Do or In Progress.</li><li>Overdue = not completed and due before today. Completed tasks are never overdue.</li><li>These numbers describe your task list only. They do not measure grades or academic performance.</li></ul></section>
      </div>
    </>
  );
}
