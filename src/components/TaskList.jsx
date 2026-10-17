import { useState } from 'react';
import { CheckCircle2, Pencil, Trash2, CalendarDays, Clock } from 'lucide-react';
import { useTasks } from '../contexts/TasksContext.jsx';
import { useToast } from '../contexts/ToastContext.jsx';
import { StatusBadge, PriorityBadge, OverdueBadge } from './ui.jsx';
import TaskFormModal from './TaskFormModal.jsx';
import ConfirmDialog from './ConfirmDialog.jsx';
import { isOverdue } from '../utils/taskLogic.js';
import { formatDate, todayISO } from '../utils/dates.js';
import { friendlyError } from '../lib/errors.js';
import { formatMinutes } from '../utils/planner.js';

/** A list of task cards with working Complete / Edit / Delete (with confirmation). Used on many pages. */
export default function TaskList({ tasks, compact = false }) {
  const { edit, remove } = useTasks();
  const toast = useToast();
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const today = todayISO();

  async function complete(task) {
    setBusyId(task.id);
    try { await edit(task.id, { ...task, status: 'completed' }); toast.success('Marked as completed. Nice one!'); }
    catch (e) { toast.error(friendlyError(e, 'Could not update the task.')); }
    finally { setBusyId(null); }
  }
  async function setStatus(task, status) {
    setBusyId(task.id);
    try { await edit(task.id, { ...task, status }); toast.success('Status updated.'); }
    catch (e) { toast.error(friendlyError(e, 'Could not update the task.')); }
    finally { setBusyId(null); }
  }

  return (
    <>
      <ul className="space-y-3">
        {tasks.map((t) => {
          const overdue = isOverdue(t, today);
          return (
            <li key={t.id} className={`card !p-3 sm:!p-4 ${t.status === 'completed' ? 'opacity-80' : ''}`}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className={`break-words font-bold ${t.status === 'completed' ? 'line-through' : ''}`}>{t.title}</h3>
                  <p className="text-sm text-muted">{t.subject} · {t.task_type}</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <StatusBadge status={t.status} /><PriorityBadge priority={t.priority} />{overdue && <OverdueBadge />}
                </div>
              </div>
              {!compact && t.description && <p className="mt-2 whitespace-pre-line break-words text-sm">{t.description}</p>}
              <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
                <span className="inline-flex items-center gap-1"><CalendarDays className="h-4 w-4" aria-hidden="true" />Due {formatDate(t.due_date)}</span>
                {t.planned_date && <span>Planned {formatDate(t.planned_date, false)}</span>}
                {t.estimated_minutes && <span className="inline-flex items-center gap-1"><Clock className="h-4 w-4" aria-hidden="true" />{formatMinutes(t.estimated_minutes)}</span>}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {t.status !== 'completed' && (
                  <button className="btn-primary" onClick={() => complete(t)} disabled={busyId === t.id}>
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />Mark complete
                  </button>
                )}
                <label className="sr-only" htmlFor={`st-${t.id}`}>Change status of {t.title}</label>
                <select id={`st-${t.id}`} className="field !w-auto" value={t.status} disabled={busyId === t.id} onChange={(e) => setStatus(t, e.target.value)}>
                  <option value="todo">To Do</option><option value="in_progress">In Progress</option><option value="completed">Completed</option>
                </select>
                <button className="btn-secondary" onClick={() => setEditing(t)} aria-label={`Edit ${t.title}`}><Pencil className="h-4 w-4" aria-hidden="true" />Edit</button>
                <button className="btn-danger" onClick={() => setDeleting(t)} aria-label={`Delete ${t.title}`}><Trash2 className="h-4 w-4" aria-hidden="true" />Delete</button>
              </div>
            </li>
          );
        })}
      </ul>
      {editing && <TaskFormModal key={editing.id} open task={editing} onClose={() => setEditing(null)} />}
      <ConfirmDialog
        open={Boolean(deleting)} title="Delete this task?"
        message={deleting ? `“${deleting.title}” will be permanently deleted. This cannot be undone.` : ''}
        onCancel={() => setDeleting(null)}
        onConfirm={async () => { await remove(deleting.id); toast.success('Task deleted.'); setDeleting(null); }}
      />
    </>
  );
}
