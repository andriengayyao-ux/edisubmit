import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// "Configured" means both variables exist and the URL looks real (not the YOUR_PROJECT_URL placeholder).
export const isSupabaseConfigured = Boolean(url && key && /^https?:\/\/.+/.test(url));

// When not configured, supabase is null. Every caller must check isSupabaseConfigured first,
// so the app never pretends that login or database calls work.
export const supabase = isSupabaseConfigured
  ? createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } })
  : null;

export const CONFIG_MESSAGE =
  'Supabase is not configured. Create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY, then restart npm.cmd run dev. See SETUP_GUIDE.md.';
