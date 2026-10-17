import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

const ToastContext = createContext(null);

/** Small success/error messages. Errors stay until closed; success disappears after 4 seconds. */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const push = useCallback((kind, message) => {
    const id = nextId.current++;
    setToasts((t) => [...t, { id, kind, message }]);
    if (kind === 'success') setTimeout(() => dismiss(id), 4000);
  }, [dismiss]);

  const api = { success: (m) => push('success', m), error: (m) => push('error', m) };
  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[60] flex flex-col items-center gap-2 px-3 lg:bottom-6" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} role={t.kind === 'error' ? 'alert' : 'status'}
            className={`pointer-events-auto flex w-full max-w-md items-start gap-2 rounded-xl border p-3 text-sm shadow-lg ${t.kind === 'error' ? 'border-danger/40 bg-danger-bg text-danger' : 'border-ok/40 bg-ok-bg text-ok'}`}>
            {t.kind === 'error' ? <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> : <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />}
            <span className="flex-1 break-words">{t.message}</span>
            <button onClick={() => dismiss(t.id)} className="-m-2 p-2" aria-label="Dismiss message"><X className="h-4 w-4" aria-hidden="true" /></button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
