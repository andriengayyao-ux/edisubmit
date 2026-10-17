// Date helpers. Due dates are plain "YYYY-MM-DD" strings, so they never shift by timezone.
// All arithmetic goes through UTC so daylight-saving/timezone offsets cannot move a date.
export const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
export const WEEKDAY_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

const pad = (n) => String(n).padStart(2, '0');

/** month is 1-12 */
export function toISO(y, m, d) { return `${y}-${pad(m)}-${pad(d)}`; }

export function daysInMonth(y, m) { return new Date(Date.UTC(y, m, 0)).getUTCDate(); }

export function parseISO(s) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s ?? ''));
  if (!match) return null;
  const y = +match[1], m = +match[2], d = +match[3];
  if (m < 1 || m > 12 || d < 1 || d > daysInMonth(y, m)) return null;
  return { y, m, d };
}
export const isValidISODate = (s) => parseISO(s) !== null;

/** Today in the device's local timezone (the student's clock), as YYYY-MM-DD. */
export function todayISO(now = new Date()) {
  return toISO(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

export function addDays(iso, n) {
  const p = parseISO(iso);
  const dt = new Date(Date.UTC(p.y, p.m - 1, p.d + n));
  return toISO(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate());
}

/** Whole days from b to a (a - b). */
export function diffDays(a, b) {
  const pa = parseISO(a), pb = parseISO(b);
  return Math.round((Date.UTC(pa.y, pa.m - 1, pa.d) - Date.UTC(pb.y, pb.m - 1, pb.d)) / 86400000);
}

/** 0 = Sunday ... 6 = Saturday */
export function weekdayIndex(iso) {
  const p = parseISO(iso);
  return new Date(Date.UTC(p.y, p.m - 1, p.d)).getUTCDay();
}

/** Monday of the week containing iso. */
export function startOfWeek(iso) { return addDays(iso, -((weekdayIndex(iso) + 6) % 7)); }

/** Convert a timestamptz string (e.g. completed_at) to the user's local calendar date. */
export function timestampToLocalISO(ts) {
  const d = new Date(ts);
  return toISO(d.getFullYear(), d.getMonth() + 1, d.getDate());
}

export function formatDate(iso, withYear = true) {
  const p = parseISO(iso);
  if (!p) return '';
  return `${MONTH_NAMES[p.m - 1].slice(0, 3)} ${p.d}${withYear ? `, ${p.y}` : ''}`;
}
