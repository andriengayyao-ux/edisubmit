// Timestamp-based timer maths: we store WHEN the timer ends, not a counter that ticks,
// so the countdown stays correct even if the tab sleeps or the phone screen locks.
export const remainingSeconds = (endAtMs, nowMs) => Math.max(0, Math.ceil((endAtMs - nowMs) / 1000));

export function formatClock(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

/** Clamp minutes typed by the user to a safe whole number. */
export function clampMinutes(value, min, max, fallback) {
  const n = Math.floor(Number(value));
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}
