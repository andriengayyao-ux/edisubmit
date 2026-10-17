import { useState, useMemo } from 'react';
import Modal from './Modal.jsx';
import { useTasks } from '../contexts/TasksContext.jsx';
import { useToast } from '../contexts/ToastContext.jsx';
import { TASK_TYPES, PRIORITIES, STATUSES, STATUS_LABELS, PRIORITY_LABELS, LIMITS } from '../config/constants.js';
import { validateTask } from '../utils/validation.js';
import { uniqueSubjects } from '../utils/filters.js';
import { friendlyError } from '../lib/errors.js';

const blank = (defaults) => ({
  title: '', description: '', subject: '', task_type: 'Assignment', priority: 'medium', status: 'todo',
  due_date: '', planned_date: '', estimated_minutes: '', ...defaults,
});

// Defined OUTSIDE the form component: if it were defined inside, React would remount the inputs on
// every keystroke and the cursor would lose focus.
function Field({ id, label, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      {children}
      {error && <p id={`${id}-err`} className="err" role="alert">{error}</p>}
    </div>
  );
}

/** Create (no `task`) or edit (`task` given) form. Saves to the database, and only closes on success. */
export default function TaskFormModal({ open, onClose, task = null, defaults = {} }) {
  const { tasks, add, edit } = useTasks();
  const toast = useToast();
  const editing = Boolean(task);
  const [values, setValues] = useState(() => (task ? blank({
    ...task, description: task.description || '', planned_date: task.planned_date || '',
    estimated_minutes: task.estimated_minutes ?? '',
  }) : blank(defaults)));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const subjects = useMemo(() => uniqueSubjects(tasks), [tasks]);

  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    const errs = validateTask(values);
    setErrors(errs); setFormError('');
    if (Object.keys(errs).length) return;
    setSaving(true);
    try {
      if (editing) await edit(task.id, values); else await add(values);
      toast.success(editing ? 'Task updated.' : 'Task added. Kaya mo \u2019yan.');
      onClose();
    } catch (err) {
      setFormError(friendlyError(err, 'Could not save the task.'));
    } finally { setSaving(false); }
  }

  const aria = (id, key) => ({ 'aria-invalid': errors[key] ? 'true' : undefined, 'aria-describedby': errors[key] ? `${id}-err` : undefined });

  return (
    <Modal open={open} onClose={saving ? () => {} : onClose} title={editing ? 'Edit task' : 'New task'} wide>
      <form onSubmit={submit} noValidate className="space-y-4">
        <Field id="tf-title" label="Title *" error={errors.title}>
          <input id="tf-title" className="field" value={values.title} onChange={set('title')} maxLength={LIMITS.title + 20} data-autofocus {...aria('tf-title', 'title')} />
        </Field>
        <Field id="tf-subject" label="Subject / course *" error={errors.subject}>
          <input id="tf-subject" className="field" list="tf-subjects" value={values.subject} onChange={set('subject')} {...aria('tf-subject', 'subject')} />
          <datalist id="tf-subjects">{subjects.map((s) => <option key={s} value={s} />)}</datalist>
        </Field>
        <Field id="tf-desc" label="Description" error={errors.description}>
          <textarea id="tf-desc" rows={3} className="field" value={values.description} onChange={set('description')} {...aria('tf-desc', 'description')} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="tf-type" label="Type" error={errors.task_type}>
            <select id="tf-type" className="field" value={values.task_type} onChange={set('task_type')}>{TASK_TYPES.map((t) => <option key={t}>{t}</option>)}</select>
          </Field>
          <Field id="tf-priority" label="Priority" error={errors.priority}>
            <select id="tf-priority" className="field" value={values.priority} onChange={set('priority')}>{PRIORITIES.map((p) => <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>)}</select>
          </Field>
          <Field id="tf-status" label="Status" error={errors.status}>
            <select id="tf-status" className="field" value={values.status} onChange={set('status')}>{STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}</select>
          </Field>
          <Field id="tf-due" label="Due date *" error={errors.due_date}>
            <input id="tf-due" type="date" className="field" value={values.due_date} onChange={set('due_date')} {...aria('tf-due', 'due_date')} />
          </Field>
          <Field id="tf-plan" label="Planned study day (optional)" error={errors.planned_date}>
            <input id="tf-plan" type="date" className="field" value={values.planned_date} onChange={set('planned_date')} {...aria('tf-plan', 'planned_date')} />
          </Field>
          <Field id="tf-min" label="Estimated minutes (optional)" error={errors.estimated_minutes}>
            <input id="tf-min" type="number" inputMode="numeric" min={LIMITS.minMinutes} max={LIMITS.maxMinutes} className="field" value={values.estimated_minutes} onChange={set('estimated_minutes')} {...aria('tf-min', 'estimated_minutes')} />
          </Field>
        </div>
        {formError && <p role="alert" className="err break-words">{formError}</p>}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" className="btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving…' : editing ? 'Save changes' : 'Add task'}</button>
        </div>
      </form>
    </Modal>
  );
}
