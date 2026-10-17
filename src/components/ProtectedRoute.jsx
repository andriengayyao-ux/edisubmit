import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { isSupabaseConfigured, CONFIG_MESSAGE } from '../lib/supabase.js';
import { Spinner } from './ui.jsx';
import Logo from './Logo.jsx';

/** Only signed-in users pass. Without Supabase config we say so plainly instead of faking a login. */
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (!isSupabaseConfigured) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-4 p-4"><Logo />
        <div role="alert" className="card border-warn/40 bg-warn-bg text-warn"><h1 className="mb-1 font-bold">Setup needed</h1><p className="text-sm">{CONFIG_MESSAGE}</p></div>
      </div>
    );
  }
  if (loading) return <Spinner label="Restoring your session…" />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children;
}
