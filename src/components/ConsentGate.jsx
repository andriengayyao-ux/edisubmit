import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { hasCurrentConsent, recordConsent } from '../lib/consent.js';
import { friendlyError } from '../lib/errors.js';
import { Spinner } from './ui.jsx';
import { PrivacyNoticeModal } from './PolicyContent.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { POLICY_VERSION } from '../config/constants.js';
import Logo from './Logo.jsx';

/**
 * Wraps the private app. It asks the DATABASE whether the current policy version was acknowledged.
 *  - Normal case: the registration trigger already saved it -> children render.
 *  - Policy changed, or saving failed earlier -> the user must acknowledge now (truthful recovery path).
 */
export default function ConsentGate({ children }) {
  const { user, signOut } = useAuth();
  const [state, setState] = useState('checking'); // checking | ok | missing | error
  const [error, setError] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showNotice, setShowNotice] = useState(false);

  const check = useCallback(async () => {
    setState('checking'); setError('');
    try { setState((await hasCurrentConsent()) ? 'ok' : 'missing'); }
    catch (e) { setError(friendlyError(e, 'Could not check your privacy acknowledgement.')); setState('error'); }
  }, []);
  useEffect(() => { check(); }, [check, user?.id]);

  async function accept() {
    setSaving(true); setError('');
    try { await recordConsent(); setState('ok'); }
    catch (e) { setError(`Your agreement was NOT saved. ${friendlyError(e)}`); }
    finally { setSaving(false); }
  }

  if (state === 'ok') return children;
  if (state === 'checking') return <Spinner label="Checking your privacy acknowledgement…" />;
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-4 p-4">
      <Logo />
      <div className="card space-y-4">
        {state === 'error' ? (
          <>
            <h1 className="text-xl font-bold">We couldn’t verify your privacy agreement</h1>
            <p role="alert" className="err break-words">{error}</p>
            <button className="btn-primary w-full" onClick={check}>Try again</button>
          </>
        ) : (
          <>
            <h1 className="text-xl font-bold">Privacy Policy acknowledgement needed</h1>
            <p className="text-sm text-muted">No record of your agreement to the current policy (version {POLICY_VERSION}) was found. Please read it and agree to continue.</p>
            <label className="flex items-start gap-3 text-sm">
              <input type="checkbox" className="mt-1 h-5 w-5 shrink-0 accent-[var(--c-primary)]" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
              <span>I have read and agree to the EdiSubmit <Link to="/privacy" target="_blank" rel="noopener noreferrer" className="font-semibold text-accent-text underline">Privacy Policy</Link> and understand how my account information and academic task data will be collected, used, and stored as explained in the policy.</span>
            </label>
            <button type="button" className="text-sm font-semibold text-accent-text underline" onClick={() => setShowNotice(true)}>Data Privacy Notice</button>
            {error && <p role="alert" className="err break-words">{error}</p>}
            <button className="btn-primary w-full" disabled={!agreed || saving} onClick={accept}>{saving ? 'Saving…' : 'I agree and continue'}</button>
          </>
        )}
        <button className="btn-ghost w-full" onClick={() => signOut().catch(() => {})}>Log out instead</button>
      </div>
      <PrivacyNoticeModal open={showNotice} onClose={() => setShowNotice(false)} />
    </div>
  );
}
