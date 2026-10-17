import { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ListChecks, CalendarDays, AlarmClock, CalendarRange, Timer, BarChart3, UserRound, Menu, LogOut } from 'lucide-react';
import Logo from './Logo.jsx';
import Modal from './Modal.jsx';
import ConsentGate from './ConsentGate.jsx';
import { ThemeToggle, ConfigWarning } from './ui.jsx';
import { TasksProvider } from '../contexts/TasksContext.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useToast } from '../contexts/ToastContext.jsx';
import { CONTACT_EMAIL, APP_NAME } from '../config/constants.js';

const SkipLink = () => (
  <a href="#main" className="sr-only z-[70] rounded-lg bg-primary px-4 py-2 font-semibold text-white focus:not-sr-only focus:fixed focus:left-3 focus:top-3">Skip to content</a>
);

/** Layout for public pages: landing, login, register, privacy, 404. */
export function PublicLayout() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return (
    <div className="flex min-h-dvh flex-col">
      <SkipLink />
      <ConfigWarning />
      <header className="border-b border-line bg-bg/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3">
          <Link to="/" aria-label={`${APP_NAME} home`}><Logo size={34} /></Link>
          <nav className="flex items-center gap-1 sm:gap-2" aria-label="Main">
            <ThemeToggle />
            {user ? <Link to="/dashboard" className="btn-primary">Open app</Link> : (
              <>
                <Link to="/login" className="btn-ghost">Log in</Link>
                <Link to="/register" className="btn-primary">Get started</Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main id="main" className="flex-1"><Outlet /></main>
      <footer className="border-t border-line bg-bg2 px-4 py-6 text-sm text-muted">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {APP_NAME} · CPP123 student project, Pamantasan ng Cabuyao</p>
          <p className="flex flex-wrap gap-x-4"><Link to="/privacy" className="underline">Privacy Policy</Link><span className="break-all">Contact: {CONTACT_EMAIL}</span></p>
        </div>
      </footer>
    </div>
  );
}

export const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/tasks', label: 'Tasks', icon: ListChecks },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/deadlines', label: 'Deadlines', icon: AlarmClock },
  { to: '/planner', label: 'Planner', icon: CalendarRange },
  { to: '/focus', label: 'Focus', icon: Timer },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/profile', label: 'Profile', icon: UserRound },
];
const BOTTOM = NAV.slice(0, 4);

function SidebarLinks({ onNavigate }) {
  return (
    <nav aria-label="Main" className="space-y-1">
      {NAV.map(({ to, label, icon: Icon }) => (
        <NavLink key={to} to={to} onClick={onNavigate}
          className={({ isActive }) => `flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold ${isActive ? 'bg-primary text-white' : 'text-violet-100 hover:bg-white/10'}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />{label}
        </NavLink>
      ))}
    </nav>
  );
}

/** Layout for signed-in pages: sidebar on laptops, top bar + bottom navigation on phones. */
export function AppShell() {
  const { signOut } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => { setMenuOpen(false); window.scrollTo(0, 0); }, [pathname]);

  async function logout() {
    try { await signOut(); navigate('/', { replace: true }); }
    catch (e) { toast.error(e.message || 'Could not log out.'); }
  }

  return (
    <ConsentGate>
      <TasksProvider>
        <SkipLink />
        <div className="min-h-dvh lg:pl-64">
          <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col gap-6 bg-sidebar p-4 text-violet-100 lg:flex">
            <Link to="/dashboard" className="px-2 pt-2 text-white" aria-label="EdiSubmit dashboard"><Logo size={34} mono /></Link>
            <div className="flex-1 overflow-y-auto"><SidebarLinks /></div>
            <button onClick={logout} className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold hover:bg-white/10"><LogOut className="h-5 w-5" aria-hidden="true" />Log out</button>
          </aside>

          <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-bg/95 px-3 py-2 backdrop-blur lg:hidden">
            <Link to="/dashboard" aria-label="EdiSubmit dashboard"><Logo size={30} /></Link>
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <button className="btn-ghost !px-3" onClick={() => setMenuOpen(true)} aria-label="Open menu"><Menu className="h-5 w-5" aria-hidden="true" /></button>
            </div>
          </header>

          <main id="main" className="mx-auto max-w-6xl px-3 pb-28 pt-4 sm:px-6 lg:pb-10 lg:pt-8">
            <div className="mb-4 hidden justify-end lg:flex"><ThemeToggle /></div>
            <Outlet />
          </main>

          <nav aria-label="Quick navigation" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-line bg-card pb-[env(safe-area-inset-bottom)] lg:hidden">
            {BOTTOM.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} className={({ isActive }) => `flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs font-semibold ${isActive ? 'text-accent-text' : 'text-muted'}`}>
                <Icon className="h-5 w-5" aria-hidden="true" />{label}
              </NavLink>
            ))}
          </nav>

          <Modal open={menuOpen} onClose={() => setMenuOpen(false)} title="Menu">
            <div className="rounded-xl bg-sidebar p-2"><SidebarLinks onNavigate={() => setMenuOpen(false)} /></div>
            <button onClick={logout} className="btn-secondary mt-3 w-full"><LogOut className="h-4 w-4" aria-hidden="true" />Log out</button>
          </Modal>
        </div>
      </TasksProvider>
    </ConsentGate>
  );
}
