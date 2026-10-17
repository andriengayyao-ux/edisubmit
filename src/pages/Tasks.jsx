import { useMemo, useState } from 'react';
import { Plus, Search, ClipboardList } from 'lucide-react';
import { useTasks } from '../contexts/TasksContext.jsx';
import { Spinner, ErrorBox, EmptyState } from '../components/ui.jsx';
import TaskList from '../components/TaskList.jsx';
import TaskFormModal from '../components/TaskFormModal.jsx';
import { filterTasks, sortTasks, uniqueSubjects } from '../utils/filters.js';
import { TASK_TYPES, STATUSES, PRIORITIES, STATUS_LABELS, PRIORITY_LABELS } from '../config/constants.js';

// Outside the page component so React does not remount the <select> on every render.
function Sel({ id, label, value, onChange, children }) {
  return <div><label htmlFor={id} className="label">{label}</label><select id={id} className="field" value={value} onChange={onChange}>{children}</select></div>;
}

const PAGE = 10; // simple "show more" pagination so long lists stay fast

export default function Tasks() {
  const { tasks, loading, error, reload } = useTasks();
  const [creating, setCreating] = useState(false);
  const [f, setF] = useState({ search: '', status: 'all', priority: 'all', subject: 'all', type: 'all' });
  const [sort, setSort] = useState('due_asc');
  const [shown, setShown] = useState(PAGE);
  const set = (k) => (e) => { setF((x) => ({ ...x, [k]: e.target.value })); setShown(PAGE); };
  const subjects = useMemo(() => uniqueSubjects(tasks), [tasks]);
  const result = useMemo(() => sortTasks(filterTasks(tasks, f), sort), [tasks, f, sort]);

  if (loading) return <Spinner label="Loading your tasks…" />;
  if (error) return <ErrorBox message={error} onRetry={reload} />;

  const filtered = f.search || f.status !== 'all' || f.priority !== 'all' || f.subject !== 'all' || f.type !== 'all';

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold sm:text-3xl">Tasks</h1>
        <button className="btn-primary" onClick={() => setCreating(true)}><Plus className="h-4 w-4" aria-hidden="true" />New task</button>
      </div>

      {tasks.length === 0 ? (
        <EmptyState icon={ClipboardList} title="Wala pang tasks." text="Magdagdag ka muna ng isa. Hindi pa submitted? Add mo muna sa list."
          action={<button className="btn-primary" onClick={() => setCreating(true)}>Add your first task</button>} />
      ) : (
        <>
          <section className="card mb-4 space-y-3" aria-label="Search, filter and sort">
            <div className="relative">
              <label htmlFor="q" className="label">Search title, description or subject</label>
              <Search className="pointer-events-none absolute bottom-3 left-3 h-4 w-4 text-muted" aria-hidden="true" />
              <input id="q" type="search" className="field !pl-9" value={f.search} onChange={set('search')} placeholder="e.g. essay" />
            </div>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
              <Sel id="f-status" label="Status" value={f.status} onChange={set('status')}><option value="all">All</option>{STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}</Sel>
              <Sel id="f-pri" label="Priority" value={f.priority} onChange={set('priority')}><option value="all">All</option>{PRIORITIES.map((p) => <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>)}</Sel>
              <Sel id="f-sub" label="Subject" value={f.subject} onChange={set('subject')}><option value="all">All</option>{subjects.map((s) => <option key={s}>{s}</option>)}</Sel>
              <Sel id="f-type" label="Type" value={f.type} onChange={set('type')}><option value="all">All</option>{TASK_TYPES.map((t) => <option key={t}>{t}</option>)}</Sel>
              <Sel id="sort" label="Sort by" value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="due_asc">Due date (soonest)</option><option value="due_desc">Due date (latest)</option>
                <option value="priority_desc">Priority (high first)</option><option value="created_desc">Recently added</option></Sel>
            </div>
            {filtered && <button className="btn-ghost" onClick={() => setF({ search: '', status: 'all', priority: 'all', subject: 'all', type: 'all' })}>Clear filters</button>}
          </section>

          <p className="mb-2 text-sm text-muted" aria-live="polite">Showing {Math.min(shown, result.length)} of {result.length} task{result.length === 1 ? '' : 's'}.</p>
          {result.length === 0 ? (
            <EmptyState icon={Search} title="No tasks match." text="Try a different search or clear the filters." />
          ) : (
            <>
              <TaskList tasks={result.slice(0, shown)} />
              {shown < result.length && <button className="btn-secondary mt-4 w-full" onClick={() => setShown((n) => n + PAGE)}>Show more</button>}
            </>
          )}
        </>
      )}
      {creating && <TaskFormModal open onClose={() => setCreating(false)} />}
    </>
  );
}
