import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, AlertTriangle, CalendarRange } from 'lucide-react';
import { useTasks } from '../contexts/TasksContext.jsx';
import { useToast } from '../contexts/ToastContext.jsx';
import { Spinner, ErrorBox, EmptyState, PriorityBadge } from '../components/ui.jsx';
import TaskFormModal from '../components/TaskFormModal.jsx';
import { weekDays, summarizeWeek, unscheduledTasks, formatMinutes } from '../utils/planner.js';
import { startOfWeek, addDays, todayISO, formatDate, weekdayIndex, WEEKDAY_SHORT } from '../utils/dates.js';
import { OVERLOAD_MINUTES } from '../config/constants.js';
import { friendlyError } from '../lib/errors.js';

export default function Planner() {
  const { tasks, loading, error, reload, edit } = useTasks();
  const toast = useToast();
  const today = todayISO();
  const [start, setStart] = useState(startOfWeek(today));
  const [editing, setEditing] = useState(null);
  const days = useMemo(() => weekDays(start), [start]);
  const week = useMemo(() => summarizeWeek(tasks, days), [tasks, days]);
  const unscheduled = useMemo(() => unscheduledTasks(tasks), [tasks]);

  if (loading) return <Spinner label="Loading planner…" />;
  if (error) return <ErrorBox message={error} onRetry={reload} />;

  const totalMin = week.reduce((s, d) => s + d.minutes, 0);
  const totalTasks = week.reduce((s, d) => s + d.tasks.length, 0);
  const overloaded = week.filter((d) => d.overloaded);

  async function plan(task, planned_date) {
    try { await edit(task.id, { ...task, planned_date: planned_date || null }); toast.success(planned_date ? `Planned for ${formatDate(planned_date, false)}.` : 'Removed from the plan.'); }
    catch (e) { toast.error(friendlyError(e, 'Could not update the plan.')); }
  }
  const label = (iso) => `${WEEKDAY_SHORT[weekdayIndex(iso)]} ${formatDate(iso, false)}`;

  return (
    <>
      <h1 className="text-2xl font-extrabold sm:text-3xl">Study planner</h1>
      <p className="mb-4 text-sm text-muted">Assign each open task a study day and an estimate. A day above {formatMinutes(OVERLOAD_MINUTES)} is flagged as overloaded.</p>

      <div className="card mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button className="btn-secondary !px-3" onClick={() => setStart(addDays(start, -7))} aria-label="Previous week"><ChevronLeft className="h-5 w-5" aria-hidden="true" /></button>
          <h2 className="font-bold" aria-live="polite">{formatDate(days[0], false)} – {formatDate(days[6])}</h2>
          <button className="btn-secondary !px-3" onClick={() => setStart(addDays(start, 7))} aria-label="Next week"><ChevronRight className="h-5 w-5" aria-hidden="true" /></button>
          <button className="btn-ghost" onClick={() => setStart(startOfWeek(today))}>This week</button>
        </div>
        <p className="text-sm text-muted">{totalTasks} planned task{totalTasks === 1 ? '' : 's'} · {formatMinutes(totalMin)} · {overloaded.length ? `${overloaded.length} overloaded day${overloaded.length === 1 ? '' : 's'}` : 'no overloaded days'}</p>
      </div>

      {tasks.length === 0 ? <EmptyState icon={CalendarRange} title="Nothing to plan yet." text="Add a task first, then plan when you’ll work on it." /> : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="grid gap-3 sm:grid-cols-2">
            {week.map((d) => (
              <section key={d.iso} aria-label={label(d.iso)} className={`card !p-3 ${d.iso === today ? 'ring-2 ring-primary' : ''}`}>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h3 className="font-bold">{label(d.iso)}{d.iso === today && <span className="ml-1 text-xs text-accent-text">(today)</span>}</h3>
                  <span className="text-xs text-muted">{formatMinutes(d.minutes)}</span>
                </div>
                {d.overloaded && <p className="mb-2 flex items-center gap-1 rounded-lg bg-warn-bg px-2 py-1 text-xs font-semibold text-warn"><AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />Overloaded — consider moving a task</p>}
                {d.tasks.length ? (
                  <ul className="space-y-2">{d.tasks.map((t) => (
                    <li key={t.id} className="rounded-lg border border-line p-2 text-sm">
                      <button className="text-left font-semibold underline-offset-2 hover:underline" onClick={() => setEditing(t)}>{t.title}</button>
                      <p className="text-xs text-muted">{t.subject} · due {formatDate(t.due_date, false)} · {t.estimated_minutes ? formatMinutes(t.estimated_minutes) : 'no estimate'}</p>
                      <div className="mt-1 flex items-center justify-between gap-2"><PriorityBadge priority={t.priority} />
                        <button className="text-xs font-semibold text-accent-text underline" onClick={() => plan(t, '')}>Unplan</button></div>
                    </li>))}</ul>
                ) : <p className="text-sm text-muted">Free day.</p>}
              </section>
            ))}
          </div>

          <section aria-labelledby="un-h">
            <h2 id="un-h" className="mb-2 text-lg font-bold">Not planned yet ({unscheduled.length})</h2>
            {unscheduled.length === 0 ? <p className="card text-sm text-muted">Every open task has a study day.</p> : (
              <ul className="space-y-2">{unscheduled.map((t) => (
                <li key={t.id} className="card !p-3 text-sm">
                  <button className="text-left font-semibold underline-offset-2 hover:underline" onClick={() => setEditing(t)}>{t.title}</button>
                  <p className="text-xs text-muted">{t.subject} · due {formatDate(t.due_date)}</p>
                  <label htmlFor={`pl-${t.id}`} className="label mt-2 !mb-0.5 text-xs">Plan for this week</label>
                  <select id={`pl-${t.id}`} className="field" value="" onChange={(e) => e.target.value && plan(t, e.target.value)}>
                    <option value="">Choose a day…</option>{days.map((iso) => <option key={iso} value={iso}>{label(iso)}</option>)}
                  </select>
                </li>))}</ul>
            )}
          </section>
        </div>
      )}
      {editing && <TaskFormModal key={editing.id} open task={editing} onClose={() => setEditing(null)} />}
    </>
  );
}
