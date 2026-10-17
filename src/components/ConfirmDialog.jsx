import { useState } from 'react';
import Modal from './Modal.jsx';

/** Confirmation before destructive actions. onConfirm may be async; errors are shown inside the dialog. */
export default function ConfirmDialog({ open, title, message, confirmLabel = 'Delete', onConfirm, onCancel }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function run() {
    setBusy(true); setError('');
    try { await onConfirm(); }
    catch (e) { setError(e.message || 'Action failed.'); }
    finally { setBusy(false); }
  }
  return (
    <Modal open={open} onClose={busy ? () => {} : onCancel} title={title}>
      <p className="text-sm text-muted">{message}</p>
      {error && <p role="alert" className="err">{error}</p>}
      <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button type="button" className="btn-secondary" onClick={onCancel} disabled={busy} data-autofocus>Cancel</button>
        <button type="button" className="btn-danger" onClick={run} disabled={busy}>{busy ? 'Working…' : confirmLabel}</button>
      </div>
    </Modal>
  );
}
