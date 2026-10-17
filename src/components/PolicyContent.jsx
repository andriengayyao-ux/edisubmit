import { policyIntro, policySections, policyMeta, noticePoints } from '../content/privacyPolicy.js';
import { Link } from 'react-router-dom';
import Modal from './Modal.jsx';

/** Renders the shared policy text. Same data feeds /privacy, the modal, and the documentation. */
export function PolicyContent() {
  return (
    <div className="space-y-5">
      <p className="text-sm text-muted">Last updated: {policyMeta.lastUpdated} · Version {policyMeta.version}</p>
      <p>{policyIntro}</p>
      {policySections.map((s) => (
        <section key={s.id} aria-labelledby={`p-${s.id}`}>
          <h2 id={`p-${s.id}`} className="mb-1 text-lg font-bold">{s.title}</h2>
          {(s.paragraphs || []).map((p, i) => <p key={i} className="mb-2 text-sm leading-relaxed">{p}</p>)}
          {s.bullets && <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed">{s.bullets.map((b, i) => <li key={i}>{b}</li>)}</ul>}
        </section>
      ))}
    </div>
  );
}

/** Short "Data Privacy Notice" modal used on the login and register pages. */
export function PrivacyNoticeModal({ open, onClose }) {
  return (
    <Modal open={open} onClose={onClose} title="Data Privacy Notice">
      <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed">
        {noticePoints.map((p, i) => <li key={i}>{p}</li>)}
      </ul>
      <p className="mt-4 text-xs text-muted">Reading this notice is not the same as agreeing. On the registration page you must tick the agreement box yourself.</p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Link to="/privacy" onClick={onClose} className="btn-secondary">Read Full Privacy Policy</Link>
        <button type="button" className="btn-primary" onClick={onClose} data-autofocus>Close</button>
      </div>
    </Modal>
  );
}
