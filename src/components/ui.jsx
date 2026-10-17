import { Link } from 'react-router-dom';
import { Loader2, Moon, Sun, AlertTriangle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { STATUS_LABELS, PRIORITY_LABELS } from '../config/constants.js';
import { CONFIG_MESSAGE, isSupabaseConfigured } from '../lib/supabase.js';

export function Spinner({ label = 'Loading…' }) {
  return (
    <div role="status" className="flex items-center justify-center gap-2 p-8 text-muted">
      <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /><span>{label}</span>
    </div>
  );
}

export function ErrorBox({ message, onRetry }) {
  if (!message) return null;
  return (
    <div role="alert" className="card flex flex-col gap-3 border-danger/40 bg-danger-bg text-danger sm:flex-row sm:items-center">
      <span className="flex-1 break-words text-sm">{message}</span>
      {onRetry && <button className="btn-secondary" onClick={onRetry}>Try again</button>}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, text, action }) {
  return (
    <div className="card flex flex-col items-center gap-2 py-10 text-center">
      {Icon && <Icon className="h-10 w-10 text-accent-text" aria-hidden="true" />}
      <h3 className="text-lg font-bold">{title}</h3>
      {text && <p className="max-w-sm text-sm text-muted">{text}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

// Status and priority always show a TEXT label, never color alone.
const STATUS_STYLE = {
  todo: 'bg-elevated text-ink border-line',
  in_progress: 'bg-warn-bg text-warn border-warn/40',
  completed: 'bg-ok-bg text-ok border-ok/40',
};
const PRIORITY_STYLE = {
  low: 'bg-elevated text-muted border-line',
  medium: 'bg-warn-bg text-warn border-warn/40',
  high: 'bg-danger-bg text-danger border-danger/40',
};
const chip = 'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold';
export const StatusBadge = ({ status }) => <span className={`${chip} ${STATUS_STYLE[status]}`}>{STATUS_LABELS[status]}</span>;
export const PriorityBadge = ({ priority }) => <span className={`${chip} ${PRIORITY_STYLE[priority]}`}>{PRIORITY_LABELS[priority]} priority</span>;
export const OverdueBadge = () => <span className={`${chip} border-danger/40 bg-danger-bg text-danger`}>Overdue</span>;

export function StatCard({ label, value, hint, tone = 'default' }) {
  const toneCls = tone === 'danger' ? 'text-danger' : tone === 'ok' ? 'text-ok' : 'text-ink';
  return (
    <div className="card !p-4">
      <p className="text-sm text-muted">{label}</p>
      <p className={`mt-1 text-3xl font-extrabold ${toneCls}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

/** Horizontal bars with the numbers printed next to them, so the chart is readable without color or sight. */
export function BarList({ items, emptyText = 'No data yet.' }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  if (!items.length || items.every((i) => i.value === 0)) return <p className="text-sm text-muted">{emptyText}</p>;
  return (
    <ul className="space-y-2">
      {items.map((i) => (
        <li key={i.label} className="text-sm">
          <div className="mb-1 flex justify-between gap-2"><span className="truncate">{i.label}</span><span className="font-semibold">{i.value}</span></div>
          <div className="h-2.5 overflow-hidden rounded-full bg-elevated" aria-hidden="true">
            <div className="h-full rounded-full bg-primary" style={{ width: `${(i.value / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Vertical column chart (e.g. tasks completed per week) with each value shown above its column. */
export function ColumnChart({ data }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="flex h-40 items-end gap-2" aria-hidden="true">
      {data.map((d) => (
        <div key={d.label} className="flex flex-1 flex-col items-center justify-end gap-1">
          <span className="text-xs font-semibold">{d.value}</span>
          <div className="w-full max-w-10 rounded-t-md bg-primary" style={{ height: `${Math.max(4, (d.value / max) * 100)}px`, opacity: d.value ? 1 : 0.25 }} />
          <span className="text-[11px] text-muted">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export function ThemeToggle({ className = '' }) {
  const { theme, toggle } = useTheme();
  const dark = theme === 'dark';
  return (
    <button type="button" onClick={toggle} className={`btn-ghost !px-3 ${className}`} aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}>
      {dark ? <Sun className="h-5 w-5" aria-hidden="true" /> : <Moon className="h-5 w-5" aria-hidden="true" />}
    </button>
  );
}

export function ConfigWarning() {
  if (isSupabaseConfigured) return null;
  return (
    <div role="alert" className="flex items-start gap-2 border-b border-warn/40 bg-warn-bg px-4 py-3 text-sm text-warn">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{CONFIG_MESSAGE}</span>
    </div>
  );
}

export const TextLink = ({ to, children }) => <Link to={to} className="font-semibold text-accent-text underline underline-offset-2">{children}</Link>;
