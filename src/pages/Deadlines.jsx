import { useMemo, useState } from 'react';
import { AlarmClock } from 'lucide-react';
import { useTasks } from '../contexts/TasksContext.jsx';
import { Spinner, ErrorBox, EmptyState } from '../components/ui.jsx';
import TaskList from '../components/TaskList.jsx';
import { groupByBucket, BUCKET_ORDER, BUCKET_LABELS } from '../utils/taskLogic.js';
import { filterTasks } from '../utils/filters.js';
import { todayISO } from '../utils/dates.js';
import { PRIORITIES, PRIORITY_LABELS } from '../config/constants.js';

export default function Deadlines() {
  const { tasks, loading, error, reload } = useTasks();
  const [priority, setPriority] = useState('all');
  const today = todayISO();
  const groups = useMemo(() => groupByBucket(filterTasks(tasks, { priority }), today), [tasks, priority, today]);

  if (loading) return <Spinner label="Loading deadlines…" />;
  if (error) return <ErrorBox message={error} onRetry={reload} />;

  return (
    <>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div><h1 className="text-2xl font-extrabold sm:text-3xl">Deadlines</h1><p className="text-sm text-muted">Grouped from your real due dates and statuses.</p></div>
        <div><label htmlFor="dl-pri" className="label">Priority</label>
          <select id="dl-pri" className="field" value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="all">All priorities</option>{PRIORITIES.map((p) => <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>)}</select></div>
      </div>
      {tasks.length === 0 ? <EmptyState icon={AlarmClock} title="No deadlines yet." text="Add a task with a due date and it will show up here." /> : (
        <div className="space-y-6">
          {BUCKET_ORDER.map((b) => {
            const list = groups[b];
            const heading = <h2 className={`mb-2 text-lg font-bold ${b === 'overdue' && list.length ? 'text-danger' : ''}`}>{BUCKET_LABELS[b]} <span className="text-sm font-normal text-muted">({list.length})</span></h2>;
            if (b === 'completed') {
              return <details key={b}><summary className="mb-2 min-h-11 cursor-pointer text-lg font-bold">{BUCKET_LABELS[b]} <span className="text-sm font-normal text-muted">({list.length})</span></summary>{list.length ? <TaskList tasks={list} compact /> : <p className="text-sm text-muted">None.</p>}</details>;
            }
            return <section key={b} aria-label={BUCKET_LABELS[b]}>{heading}{list.length ? <TaskList tasks={list} compact /> : <p className="text-sm text-muted">Nothing here.</p>}</section>;
          })}
        </div>
      )}
    </>
  );
}
