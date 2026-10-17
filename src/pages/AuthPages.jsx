import { useState, useEffect } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { MailCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { validateRegistration, validateLogin, MIN_PASSWORD } from '../utils/validation.js';
import { friendlyError } from '../lib/errors.js';
import { PrivacyNoticeModal } from '../components/PolicyContent.jsx';
import { Spinner } from '../components/ui.jsx';
import Logo from '../components/Logo.jsx';
import { TAGLINE, POLICY_VERSION } from '../config/constants.js';

function AuthCard({ title, subtitle, children }) {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 px-4 py-8 sm:py-12">
      <div className="flex flex-col items-center gap-1 text-center"><Logo size={44} /><p className="text-sm text-muted">{TAGLINE}</p></div>
      <div className="card space-y-4">
        <div><h1 className="text-2xl font-extrabold">{title}</h1>{subtitle && <p className="text-sm text-muted">{subtitle}</p>}</div>
        {children}
      </div>
    </div>
  );
}

function TextField({ id, label, error, ...props }) {
  return (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      <input id={id} className="field" aria-invalid={error ? 'true' : undefined} aria-describedby={error ? `${id}-err` : undefined} {...props} />
      {error && <p id={`${id}-err`} className="err" role="alert">{error}</p>}
    </div>
  );
}

export function Login() {
  const { user, loading, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(false);
  if (loading) return <Spinner />;
  if (user) return <Navigate to={location.state?.from || '/dashboard'} replace />;

  async function submit(e) {
    e.preventDefault();
    const errs = validateLogin(form); setErrors(errs); setFormError('');
    if (Object.keys(errs).length) return;
    setBusy(true);
    try { await signIn(form.email, form.password); navigate(location.state?.from || '/dashboard', { replace: true }); }
    catch (err) { setFormError(friendlyError(err, 'Could not log in.')); }
    finally { setBusy(false); }
  }
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  return (
    <AuthCard title="Welcome back" subtitle="Log in to see what’s due.">
      <form onSubmit={submit} noValidate className="space-y-4">
        <TextField id="email" label="Email" type="email" autoComplete="email" inputMode="email" value={form.email} onChange={set('email')} error={errors.email} />
        <TextField id="password" label="Password" type="password" autoComplete="current-password" value={form.password} onChange={set('password')} error={errors.password} />
        {formError && <p role="alert" className="err break-words">{formError}</p>}
        <button className="btn-primary w-full" disabled={busy}>{busy ? 'Logging in…' : 'Log in'}</button>
      </form>
      <div className="flex flex-col gap-2 text-sm sm:flex-row sm:justify-between">
        <Link to="/forgot-password" className="font-semibold text-accent-text underline">Forgot password?</Link>
        <Link to="/register" className="font-semibold text-accent-text underline">Create an account</Link>
      </div>
      <button type="button" onClick={() => setNotice(true)} className="text-sm font-semibold text-accent-text underline">Data Privacy Notice</button>
      <PrivacyNoticeModal open={notice} onClose={() => setNotice(false)} />
    </AuthCard>
  );
}

export function Register() {
  const { user, loading, signUp } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '' });
  const [agreed, setAgreed] = useState(false); // ALWAYS starts unchecked
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(false);
  const [pending, setPending] = useState(false);
  if (loading) return <Spinner />;
  if (user && !pending) return <Navigate to="/dashboard" replace />;

  async function submit(e) {
    e.preventDefault();
    const errs = validateRegistration({ ...form, agreed }); setErrors(errs); setFormError('');
    if (Object.keys(errs).length) return;   // blocked until the box is checked
    setBusy(true);
    try {
      const { needsConfirmation } = await signUp(form.email, form.password);
      if (needsConfirmation) setPending(true);
      else navigate('/dashboard', { replace: true }); // ConsentGate then verifies the saved record in the database
    } catch (err) {
      setFormError(friendlyError(err, 'Could not create the account.')); // real error, no success message
    } finally { setBusy(false); }
  }
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  if (pending) {
    return (
      <AuthCard title="Check your email">
        <div className="flex gap-3"><MailCheck className="h-8 w-8 shrink-0 text-accent-text" aria-hidden="true" />
          <div className="space-y-2 text-sm">
            <p>Supabase accepted your registration for <strong className="break-all">{form.email}</strong> and is asking you to confirm your email. Open the link in the email, then log in.</p>
            <p className="text-muted">Your agreement to Privacy Policy version {POLICY_VERSION} was sent along with your registration. When you first log in, EdiSubmit checks the database; if the record is missing it will ask you to agree again before you can continue.</p>
          </div>
        </div>
        <Link to="/login" className="btn-primary w-full">Go to log in</Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Create your account" subtitle="Less panic. More progress.">
      <form onSubmit={submit} noValidate className="space-y-4">
        <TextField id="r-email" label="Email" type="email" autoComplete="email" inputMode="email" value={form.email} onChange={set('email')} error={errors.email} />
        <TextField id="r-password" label={`Password (at least ${MIN_PASSWORD} characters)`} type="password" autoComplete="new-password" value={form.password} onChange={set('password')} error={errors.password} />
        <TextField id="r-confirm" label="Confirm password" type="password" autoComplete="new-password" value={form.confirmPassword} onChange={set('confirmPassword')} error={errors.confirmPassword} />
        <div>
          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-[var(--c-primary)]"
              aria-invalid={errors.agreed ? 'true' : undefined} aria-describedby={errors.agreed ? 'agree-err' : undefined} />
            <span>I have read and agree to the EdiSubmit Privacy Policy and understand how my account information and academic task data will be collected, used, and stored as explained in the policy.</span>
          </label>
          <p className="ml-8 mt-1 flex flex-wrap gap-x-4 text-sm">
            <Link to="/privacy" target="_blank" rel="noopener noreferrer" className="font-semibold text-accent-text underline">Privacy Policy</Link>
            <button type="button" onClick={() => setNotice(true)} className="font-semibold text-accent-text underline">Data Privacy Notice</button>
          </p>
          {errors.agreed && <p id="agree-err" role="alert" className="err ml-8">{errors.agreed}</p>}
        </div>
        {formError && <p role="alert" className="err break-words">{formError}</p>}
        <button className="btn-primary w-full" disabled={busy}>{busy ? 'Creating account…' : 'Create account'}</button>
      </form>
      <p className="text-sm">Already have an account? <Link to="/login" className="font-semibold text-accent-text underline">Log in</Link></p>
      <PrivacyNoticeModal open={notice} onClose={() => setNotice(false)} />
    </AuthCard>
  );
}

export function ForgotPassword() {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault(); setError('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError('Enter a valid email address.'); return; }
    setBusy(true);
    try { await requestPasswordReset(email); setSent(true); }
    catch (err) { setError(friendlyError(err, 'Could not send the reset email.')); }
    finally { setBusy(false); }
  }
  return (
    <AuthCard title="Reset your password" subtitle="We’ll email you a link to choose a new one.">
      {sent ? (
        <p role="status" className="text-sm">If an account exists for <strong className="break-all">{email}</strong>, Supabase has sent a reset link. Check your inbox and spam folder.</p>
      ) : (
        <form onSubmit={submit} noValidate className="space-y-4">
          <TextField id="fp-email" label="Email" type="email" autoComplete="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} error={error} />
          <button className="btn-primary w-full" disabled={busy}>{busy ? 'Sending…' : 'Send reset link'}</button>
        </form>
      )}
      <Link to="/login" className="text-sm font-semibold text-accent-text underline">Back to log in</Link>
    </AuthCard>
  );
}

export function ResetPassword() {
  const { session, loading, updatePassword } = useAuth();
  const navigate = useNavigate();
  const [pw, setPw] = useState({ password: '', confirm: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [waited, setWaited] = useState(false);
  useEffect(() => { const t = setTimeout(() => setWaited(true), 2500); return () => clearTimeout(t); }, []);

  async function submit(e) {
    e.preventDefault(); setError('');
    if (pw.password.length < MIN_PASSWORD) { setError(`Password must be at least ${MIN_PASSWORD} characters.`); return; }
    if (pw.password !== pw.confirm) { setError('Passwords do not match.'); return; }
    setBusy(true);
    try { await updatePassword(pw.password); setDone(true); setTimeout(() => navigate('/dashboard', { replace: true }), 1500); }
    catch (err) { setError(friendlyError(err, 'Could not update the password.')); }
    finally { setBusy(false); }
  }
  if (loading || (!session && !waited)) return <Spinner label="Checking your reset link…" />;
  return (
    <AuthCard title="Choose a new password">
      {!session ? (
        <p role="alert" className="text-sm text-danger">This reset link is missing or expired. Request a new one from <Link to="/forgot-password" className="underline">Forgot password</Link>.</p>
      ) : done ? (
        <p role="status" className="text-sm text-ok">Password updated. Taking you to your dashboard…</p>
      ) : (
        <form onSubmit={submit} noValidate className="space-y-4">
          <TextField id="np" label="New password" type="password" autoComplete="new-password" value={pw.password} onChange={(e) => setPw((p) => ({ ...p, password: e.target.value }))} />
          <TextField id="np2" label="Confirm new password" type="password" autoComplete="new-password" value={pw.confirm} onChange={(e) => setPw((p) => ({ ...p, confirm: e.target.value }))} error={error} />
          <button className="btn-primary w-full" disabled={busy}>{busy ? 'Saving…' : 'Update password'}</button>
        </form>
      )}
    </AuthCard>
  );
}
