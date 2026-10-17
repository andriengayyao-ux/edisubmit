import { addDays } from './dates.js';
import { OVERLOAD_MINUTES } from '../config/constants.js';

export const weekDays = (startISO) => Array.from({ length: 7 }, (_, i) => addDays(startISO, i));

/** Planned (not completed) tasks on each day with total minutes. Tasks without an estimate count as 0 min. */
export function summarizeWeek(tasks, days) {
  return days.map((iso) => {
    const dayTasks = tasks.filter((t) => t.status !== 'completed' && t.planned_date === iso);
    const minutes = dayTasks.reduce((sum, t) => sum + (t.estimated_minutes || 0), 0);
    return { iso, tasks: dayTasks, minutes, overloaded: minutes > OVERLOAD_MINUTES };
  });
}

export const unscheduledTasks = (tasks) => tasks.filter((t) => t.status !== 'completed' && !t.planned_date);

export function formatMinutes(min) {
  if (!min) return '0 min';
  const h = Math.floor(min / 60), m = min % 60;
  return h ? `${h}h${m ? ` ${m}m` : ''}` : `${m} min`;
}
