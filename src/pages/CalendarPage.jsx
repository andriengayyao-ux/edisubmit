import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useTasks } from '../contexts/TasksContext.jsx';
import { Spinner, ErrorBox } from '../components/ui.jsx';
import TaskList from '../components/TaskList.jsx';
import TaskFormModal from '../components/TaskFormModal.jsx';
import { buildMonthGrid, shiftMonth, groupTasksByDate } from '../utils/calendar.js';
import { MONTH_NAMES, WEEKDAY_SHORT, todayISO, parseISO, formatDate } from '../utils/dates.js';
import { upcomingTasks } from '../utils/taskLogic.js';

export default function CalendarPage() {
  const { tasks, loading, error, reload } = useTasks();
  const today = todayISO();
  const t = parseISO(today);
  const [view, setView] = useState({ y: t.y, m: t.m });
  const [selected, setSelected] = useState(today);
  const [creating, setCreating] = useState(false);
  const byDate = useMemo(() => groupTasksByDate(tasks), [tasks]);
  const grid = useMemo(() => buildMonthGrid(view.y, view.m), [view]);
  const upcoming = useMemo(() => upcomingTasks(tasks, today, 8), [tasks, today]);

  if (loading) return <Spinner label="Loading calendar…" />;
  if (error) return <ErrorBox message={error} onRetry={reload} />;

  const go = (d) => setView((v) => shiftMonth(v.y, v.m, d));
  const selTasks = byDate[selected] || [];

  return (
    <>
      <h1 className="mb-4 text-2xl font-extrabold sm:text-3xl">Calendar</h1>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <section className="card" aria-label="Monthly calendar">
          <div className="mb-3 flex items-center justify-between gap-2">
            <button className="btn-secondary !px-3" onClick={() => go(-1)} aria-label="Previous month"><ChevronLeft className="h-5 w-5" aria-hidden="true" /></button>
            <h2 className="text-lg font-bold" aria-live="polite">{MONTH_NAMES[view.m - 1]} {view.y}</h2>
            <button className="btn-secondary !px-3" onClick={() => go(1)} aria-label="Next month"><ChevronRight className="h-5 w-5" aria-hidden="true" /></button>
          </div>
          <button className="btn-ghost mb-2" onClick={() => { setView({ y: t.y, m: t.m }); setSelected(today); }}>Today</button>
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-muted" aria-hidden="true">{WEEKDAY_SHORT.map((d) => <div key={d}>{d}</div>)}</div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {grid.map((c) => {
              const list = byDate[c.iso] || [];
              const open = list.filter((x) => x.status !== 'completed').length;
              const isToday = c.iso === today, isSel = c.iso === selected;
              return (
                <button key={c.iso} onClick={() => setSelected(c.iso)} aria-pressed={isSel}
                  aria-label={`${formatDate(c.iso)}${isToday ? ', today' : ''}, ${list.length} task${list.length === 1 ? '' : 's'}`}
                  className={`flex min-h-12 flex-col items-center rounded-lg border p-1 text-sm sm:min-h-20 sm:items-start ${c.inMonth ? '' : 'opacity-40'} ${isSel ? 'border-primary bg-elevated' : 'border-line bg-bg'} ${isToday ? 'ring-2 ring-primary' : ''}`}>
                  <span className={`font-semibold ${isToday ? 'text-accent-text' : ''}`}>{c.day}</span>
                  {list.length > 0 && <span className={`mt-0.5 rounded-full px-1.5 text-[11px] font-bold sm:hidden ${open ? 'bg-primary text-white' : 'bg-ok-bg text-ok'}`}>{list.length}</span>}
                  <span className="mt-1 hidden w-full space-y-0.5 sm:block">
                    {list.slice(0, 2).map((x) => <span key={x.id} className={`block truncate rounded px-1 text-left text-[11px] ${x.status === 'completed' ? 'bg-ok-bg text-ok line-through' : 'bg-primary/20 text-ink'}`}>{x.title}</span>)}
                    {list.length > 2 && <span className="block text-left text-[11px] text-muted">+{list.length - 2} more</span>}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section aria-labelledby="sel-h">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h2 id="sel-h" className="text-lg font-bold">{formatDate(selected)}</h2>
            <button className="btn-primary" onClick={() => setCreating(true)}><Plus className="h-4 w-4" aria-hidden="true" />Add task</button>
          </div>
          {selTasks.length ? <TaskList tasks={selTasks} compact /> : <p className="card text-sm text-muted">No tasks due on this date.</p>}

          <h2 className="mb-2 mt-6 text-lg font-bold">Upcoming deadlines</h2>
          {upcoming.length ? (
            <ul className="space-y-2">{upcoming.map((x) => (
              <li key={x.id}><button className="card flex w-full items-center justify-between gap-2 !p-3 text-left text-sm" onClick={() => { setSelected(x.due_date); const p = parseISO(x.due_date); setView({ y: p.y, m: p.m }); }}>
                <span className="truncate font-semibold">{x.title}</span><span className="shrink-0 text-muted">{formatDate(x.due_date, false)}</span></button></li>))}</ul>
          ) : <p className="card text-sm text-muted">No upcoming deadlines.</p>}
        </section>
      </div>
      {creating && <TaskFormModal open defaults={{ due_date: selected }} onClose={() => setCreating(false)} />}
    </>
  );
}
