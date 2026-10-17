import { Link } from 'react-router-dom';
import { ListChecks, CalendarDays, AlarmClock, Timer, BarChart3, ShieldCheck, CheckCircle2, Zap } from 'lucide-react';
import { TAGLINE, DESCRIPTOR } from '../config/constants.js';

const FEATURES = [
  { icon: ListChecks, title: 'Task manager', text: 'Add assignments, quizzes, projects and exams. Search, filter and sort them your way.' },
  { icon: CalendarDays, title: 'Academic calendar', text: 'See every due date on a monthly grid, and add a task straight from a date.' },
  { icon: AlarmClock, title: 'Deadline center', text: 'Overdue, due today, tomorrow, this week — grouped from your real due dates.' },
  { icon: Timer, title: 'Planner & focus timer', text: 'Plan study time per day, then focus with a timer that survives a locked screen.' },
  { icon: BarChart3, title: 'Analytics', text: 'Completion rate, weekly progress and task breakdowns from your own records.' },
  { icon: ShieldCheck, title: 'Your data, your account', text: 'Tasks are tied to your login and protected by database Row Level Security.' },
];

export default function Landing() {
  return (
    <>
      <section className="bg-gradient-to-b from-bg2 to-bg px-4 py-14 sm:py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="mb-3 inline-flex items-center gap-1 rounded-full border border-line bg-card px-3 py-1 text-xs font-semibold text-accent-text"><Zap className="h-3.5 w-3.5" aria-hidden="true" />Kahit tinatamad, basta EdiSubmit.</p>
            <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">{TAGLINE}</h1>
            <p className="mt-4 max-w-xl text-lg text-muted">{DESCRIPTOR} Isang lugar para sa lahat ng requirements mo — para less panic, more progress.</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link to="/register" className="btn-primary !px-6">Get Started</Link>
              <Link to="/login" className="btn-secondary !px-6">Log In</Link>
            </div>
          </div>
          {/* Illustrative preview only: NOT real data */}
          <figure className="card" aria-label="Sample dashboard preview">
            <figcaption className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">Sample preview — illustrative content, not real data</figcaption>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[['To Do', '3'], ['In Progress', '2'], ['Completed', '5']].map(([l, v]) => (
                <div key={l} className="rounded-xl bg-elevated p-3"><p className="text-2xl font-extrabold">{v}</p><p className="text-xs text-muted">{l}</p></div>
              ))}
            </div>
            <ul className="mt-3 space-y-2 text-sm">
              {[['Essay draft', 'Due tomorrow', 'High priority'], ['Quiz review', 'Due in 3 days', 'Medium priority'], ['Lab report', 'Completed', 'Low priority']].map(([t, d, p]) => (
                <li key={t} className="flex items-center justify-between gap-2 rounded-xl border border-line p-3">
                  <span className="flex items-center gap-2 font-semibold"><CheckCircle2 className="h-4 w-4 text-accent-text" aria-hidden="true" />{t}</span>
                  <span className="text-right text-xs text-muted">{d} · {p}</span>
                </li>
              ))}
            </ul>
          </figure>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12" aria-labelledby="features-h">
        <h2 id="features-h" className="text-3xl font-extrabold">Everything for your requirements</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="card"><Icon className="h-7 w-7 text-accent-text" aria-hidden="true" /><h3 className="mt-2 text-lg font-bold">{title}</h3><p className="mt-1 text-sm text-muted">{text}</p></div>
          ))}
        </div>
      </section>

      <section className="bg-bg2 px-4 py-12" aria-labelledby="how-h">
        <div className="mx-auto max-w-6xl">
          <h2 id="how-h" className="text-3xl font-extrabold">How it works</h2>
          <ol className="mt-6 grid gap-4 sm:grid-cols-3">
            {['Create a free account and agree to the Privacy Policy.', 'Add your tasks with subject, type, priority and due date.', 'Check the dashboard, calendar and deadlines — then submit on time.'].map((s, i) => (
              <li key={s} className="card"><span className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-primary font-bold text-white">{i + 1}</span><p className="text-sm">{s}</p></li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12" aria-labelledby="priv-h">
        <div className="card flex flex-col gap-3 sm:flex-row sm:items-center">
          <ShieldCheck className="h-10 w-10 shrink-0 text-accent-text" aria-hidden="true" />
          <div className="flex-1"><h2 id="priv-h" className="text-xl font-bold">Privacy and security</h2>
            <p className="text-sm text-muted">Sign-in and data storage run on Supabase; the site is hosted on Vercel. Row Level Security rules are meant to keep each student’s tasks private. Read exactly what is collected and why.</p></div>
          <Link to="/privacy" className="btn-secondary">Read the Privacy Policy</Link>
        </div>
      </section>
    </>
  );
}
