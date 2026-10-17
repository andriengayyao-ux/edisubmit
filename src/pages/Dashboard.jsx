import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ClipboardList } from 'lucide-react';
import { useTasks } from '../contexts/TasksContext.jsx';
import { Spinner, ErrorBox, EmptyState, StatCard, ColumnChart } from '../components/ui.jsx';
import TaskList from '../components/TaskList.jsx';
import TaskFormModal from '../components/TaskFormModal.jsx';
import { computeStats, upcomingTasks } from '../utils/taskLogic.js';
import { weeklyCompletions } from '../utils/analytics.js';
import { todayISO, formatDate } from '../utils/dates.js';

export default function Dashboard() {
  const { tasks, loading, error, reload } = useTasks();
  const [creating, setCreating] = useState(false);
  const today = todayISO();
  const stats = useMemo(() => computeStats(tasks, today), [tasks, today]);
  const upcoming = useMemo(() => upcomingTasks(tasks, today, 5), [tasks, today]);
  const high = useMemo(() => tasks.filter((t) => t.status !== 'completed' && t.priority === 'high').sort((a, b) => a.due_date.localeCompare(b.due_date)).slice(0, 5), [tasks]);
  const recent = useMemo(() => [...tasks].sort((a, b) => String(b.created_at).localeCompare(String(a.created_at))).slice(0, 5), [tasks]);
  const weekly = useMemo(() => weeklyCompletions(tasks, today, 6).map((b) => ({ label: formatDate(b.start, false), value: b.value })), [tasks, today]);

  if (loading) return <Spinner label="Loading your dashboard…" />;
  if (error) return <ErrorBox message={error} onRetry={reload} />;

  const header = (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div><h1 className="text-2xl font-extrabold sm:text-3xl">Dashboard</h1><p className="text-sm text-muted">Today is {formatDate(today)}. Small progress beats last-minute panic.</p></div>
      <button className="btn-primary" onClick={() => setCreating(true)}><Plus className="h-4 w-4" aria-hidden="true" />New task</button>
    </div>
  );
  const modal = creating && <TaskFormModal open onClose={() => setCreating(false)} />;

  if (stats.total === 0) {
    return (<>{header}
      <EmptyState icon={ClipboardList} title="Wala pang tasks." text="Magdagdag ka muna ng isa. Your dashboard fills up from your real tasks."
        action={<button className="btn-primary" onClick={() => setCreating(true)}>Create Your First Task</button>} />
      {modal}</>);
  }

  const summary = `You have ${stats.total} task${stats.total === 1 ? '' : 's'}: ${stats.todo} to do, ${stats.inProgress} in progress and ${stats.completed} completed (${stats.completionRate}% done). ${stats.overdue} overdue, ${stats.dueToday} due today.`;
  return (
    <>
      {header}
      <p className="sr-only" aria-live="polite">{summary}</p>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total tasks" value={stats.total} />
        <StatCard label="To Do" value={stats.todo} />
        <StatCard label="In Progress" value={stats.inProgress} />
        <StatCard label="Completed" value={stats.completed} tone="ok" />
        <StatCard label="Overdue" value={stats.overdue} tone={stats.overdue ? 'danger' : 'default'} />
        <StatCard label="Due today" value={stats.dueToday} />
      </div>

      <section className="card mt-4" aria-labelledby="prog-h">
        <div className="flex items-baseline justify-between"><h2 id="prog-h" className="font-bold">Completion</h2><span className="text-2xl font-extrabold">{stats.completionRate}%</span></div>
        <div className="mt-2 h-3 overflow-hidden rounded-full bg-elevated" role="progressbar" aria-valuenow={stats.completionRate} aria-valuemin={0} aria-valuemax={100} aria-label="Completion percentage">
          <div className="h-full rounded-full bg-primary" style={{ width: `${stats.completionRate}%` }} />
        </div>
        <p className="mt-2 text-sm text-muted">{summary}</p>
      </section>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <section aria-labelledby="up-h"><h2 id="up-h" className="mb-2 text-lg font-bold">Upcoming deadlines</h2>
          {upcoming.length ? <TaskList tasks={upcoming} compact /> : <p className="card text-sm text-muted">Nothing upcoming. Enjoy the break (for now).</p>}
          <Link to="/deadlines" className="mt-2 inline-block text-sm font-semibold text-accent-text underline">See all deadlines</Link></section>
        <section aria-labelledby="hi-h"><h2 id="hi-h" className="mb-2 text-lg font-bold">High-priority tasks</h2>
          {high.length ? <TaskList tasks={high} compact /> : <p className="card text-sm text-muted">No open high-priority tasks.</p>}</section>
        <section aria-labelledby="rec-h"><h2 id="rec-h" className="mb-2 text-lg font-bold">Recently added</h2><TaskList tasks={recent} compact /></section>
        <section className="card self-start" aria-labelledby="wk-h"><h2 id="wk-h" className="mb-3 text-lg font-bold">Tasks completed per week</h2>
          <ColumnChart data={weekly} />
          <p className="mt-3 text-sm text-muted">Last 6 weeks (week starting on the date shown): {weekly.map((w) => `${w.label}: ${w.value}`).join(' · ')}.</p></section>
      </div>
      {modal}
    </>
  );
}
