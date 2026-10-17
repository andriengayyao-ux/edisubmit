import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useTasks } from '../contexts/TasksContext.jsx';
import { useToast } from '../contexts/ToastContext.jsx';
import { useTheme } from '../contexts/ThemeContext.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { listConsents } from '../lib/consent.js';
import { friendlyError } from '../lib/errors.js';
import { CONTACT_EMAIL, POLICY_VERSION } from '../config/constants.js';

export default function Profile() {
  const { user, signOut } = useAuth();
  const { tasks, removeAll } = useTasks();
  const { theme, toggle } = useTheme();
  const toast = useToast();
  const navigate = useNavigate();
  const [consents, setConsents] = useState(null);
  const [consentErr, setConsentErr] = useState('');
  const [confirmAll, setConfirmAll] = useState(false);

  useEffect(() => { listConsents().then(setConsents).catch((e) => setConsentErr(friendlyError(e))); }, []);

  async function logout() {
    try { await signOut(); navigate('/', { replace: true }); } catch (e) { toast.error(friendlyError(e, 'Could not log out.')); }
  }
  const fmt = (ts) => new Date(ts).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' });

  return (
    <>
      <h1 className="mb-4 text-2xl font-extrabold sm:text-3xl">Profile & settings</h1>
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card space-y-3" aria-labelledby="acc"><h2 id="acc" className="font-bold">Account</h2>
          <p className="break-all text-sm"><span className="text-muted">Email: </span>{user.email}</p>
          <button className="btn-secondary" onClick={logout}><LogOut className="h-4 w-4" aria-hidden="true" />Log out</button></section>

        <section className="card space-y-3" aria-labelledby="app"><h2 id="app" className="font-bold">Appearance</h2>
          <p className="text-sm text-muted">Current theme: {theme === 'dark' ? 'Dark' : 'Light'} (saved on this device only).</p>
          <button className="btn-secondary" onClick={toggle}>Switch to {theme === 'dark' ? 'light' : 'dark'} mode</button></section>

        <section className="card space-y-2" aria-labelledby="pr"><h2 id="pr" className="font-bold">Privacy acknowledgement</h2>
          {consentErr && <p role="alert" className="err">{consentErr}</p>}
          {!consents && !consentErr && <p className="text-sm text-muted">Loading…</p>}
          {consents && (consents.length ? (
            <ul className="space-y-1 text-sm">{consents.map((c) => <li key={c.policy_version}>Version <strong>{c.policy_version}</strong> — agreed {fmt(c.agreed_at)}</li>)}</ul>
          ) : <p className="text-sm text-muted">No records found.</p>)}
          <p className="text-xs text-muted">Current policy version: {POLICY_VERSION}. This is a recorded acknowledgement, not a guarantee of legal compliance.</p>
          <Link to="/privacy" className="text-sm font-semibold text-accent-text underline">Read the Privacy Policy</Link></section>

        <section className="card space-y-3" aria-labelledby="dz"><h2 id="dz" className="font-bold text-danger">Data and deletion</h2>
          <p className="text-sm text-muted">You have {tasks.length} task{tasks.length === 1 ? '' : 's'} saved.</p>
          <button className="btn-danger" onClick={() => setConfirmAll(true)} disabled={!tasks.length}><Trash2 className="h-4 w-4" aria-hidden="true" />Delete all my tasks</button>
          <p className="text-sm"><strong>Delete your account:</strong> email <span className="break-all">{CONTACT_EMAIL}</span> from your registered address. Account deletion is handled manually by the developer; there is no automatic delete-account button.</p></section>
      </div>
      <ConfirmDialog open={confirmAll} title="Delete ALL tasks?" confirmLabel="Delete everything"
        message={`All ${tasks.length} of your tasks will be permanently deleted. This cannot be undone.`}
        onCancel={() => setConfirmAll(false)}
        onConfirm={async () => { await removeAll(); toast.success('All tasks deleted.'); setConfirmAll(false); }} />
    </>
  );
}
