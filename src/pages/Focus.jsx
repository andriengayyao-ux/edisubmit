import { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { remainingSeconds, formatClock, clampMinutes } from '../utils/timer.js';

// The timer stores the END timestamp while running, so the display is always computed from the real clock.
// If the phone screen locks or the tab sleeps, the countdown is still correct when you come back.
export default function Focus() {
  const [mode, setMode] = useState('focus');                 // focus | break
  const [mins, setMins] = useState({ focus: 25, break: 5 });
  const [status, setStatus] = useState('idle');              // idle | running | paused | done
  const [left, setLeft] = useState(25 * 60);
  const [sessions, setSessions] = useState(0);
  const endAt = useRef(0);

  const total = mins[mode] * 60;

  useEffect(() => {
    if (status !== 'running') return undefined;
    const tick = () => {
      if (!endAt.current) return;               // already finished: don't count the session twice
      const r = remainingSeconds(endAt.current, Date.now());
      setLeft(r);
      if (r === 0) { endAt.current = 0; setStatus('done'); if (mode === 'focus') setSessions((n) => n + 1); }
    };
    tick();
    const id = setInterval(tick, 250);
    document.addEventListener('visibilitychange', tick); // refresh instantly when the screen wakes up
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', tick); };
  }, [status, mode]);

  useEffect(() => { document.title = status === 'running' ? `${formatClock(left)} · EdiSubmit` : 'EdiSubmit — Reklamo later. Submit first.'; return () => { document.title = 'EdiSubmit — Reklamo later. Submit first.'; }; }, [left, status]);

  function start() { endAt.current = Date.now() + left * 1000; setStatus('running'); }
  function pause() { setLeft(remainingSeconds(endAt.current, Date.now())); setStatus('paused'); }
  function reset(nextMode = mode, nextMins = mins) { setStatus('idle'); setLeft(nextMins[nextMode] * 60); }
  function switchMode(m) { setMode(m); reset(m); }
  function setLen(k, v) {
    const n = clampMinutes(v, 1, k === 'focus' ? 180 : 60, mins[k]);
    const next = { ...mins, [k]: n }; setMins(next);
    if (k === mode && status !== 'running') { setStatus('idle'); setLeft(n * 60); }
  }
  const pct = total ? Math.round(((total - left) / total) * 100) : 0;

  return (
    <>
      <h1 className="mb-1 text-2xl font-extrabold sm:text-3xl">Focus timer</h1>
      <p className="mb-4 text-sm text-muted">One task at a time. Kaya mo ’yan. Sessions are counted for this visit only and are not saved to your account.</p>
      <div className="card mx-auto max-w-md space-y-5 text-center">
        <div className="flex justify-center gap-2" role="group" aria-label="Timer mode">
          {['focus', 'break'].map((m) => (
            <button key={m} className={m === mode ? 'btn-primary' : 'btn-secondary'} aria-pressed={m === mode} onClick={() => switchMode(m)} disabled={status === 'running'}>{m === 'focus' ? 'Focus' : 'Break'}</button>
          ))}
        </div>
        <div>
          <p className="text-7xl font-extrabold tabular-nums sm:text-8xl" role="timer" aria-live="off" aria-label={`${formatClock(left)} remaining`}>{formatClock(left)}</p>
          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-elevated" aria-hidden="true"><div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${pct}%` }} /></div>
        </div>
        {status === 'done' && <p role="status" className="rounded-xl bg-ok-bg p-3 font-semibold text-ok">{mode === 'focus' ? 'Focus session complete! Time for a break.' : 'Break over. Balik sa task!'}</p>}
        <div className="flex flex-wrap justify-center gap-2">
          {status === 'running' ? <button className="btn-primary" onClick={pause}><Pause className="h-4 w-4" aria-hidden="true" />Pause</button>
            : <button className="btn-primary" onClick={status === 'done' ? () => { reset(); } : start}><Play className="h-4 w-4" aria-hidden="true" />{status === 'paused' ? 'Resume' : status === 'done' ? 'Again' : 'Start'}</button>}
          <button className="btn-secondary" onClick={() => reset()}><RotateCcw className="h-4 w-4" aria-hidden="true" />Reset</button>
        </div>
        <div className="grid grid-cols-2 gap-3 text-left">
          <div><label htmlFor="fm" className="label">Focus (minutes)</label><input id="fm" type="number" inputMode="numeric" min={1} max={180} className="field" value={mins.focus} onChange={(e) => setLen('focus', e.target.value)} disabled={status === 'running'} /></div>
          <div><label htmlFor="bm" className="label">Break (minutes)</label><input id="bm" type="number" inputMode="numeric" min={1} max={60} className="field" value={mins.break} onChange={(e) => setLen('break', e.target.value)} disabled={status === 'running'} /></div>
        </div>
        <p className="text-sm text-muted">Focus sessions completed this visit: <strong>{sessions}</strong></p>
      </div>
    </>
  );
}
