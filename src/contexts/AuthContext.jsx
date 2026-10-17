import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured, CONFIG_MESSAGE } from '../lib/supabase.js';
import { POLICY_VERSION } from '../config/constants.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(isSupabaseConfigured); // nothing to wait for if not configured

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined;
    let active = true;
    // Restore the saved session after a page refresh.
    supabase.auth.getSession().then(({ data }) => {
      if (active) { setSession(data.session); setLoading(false); }
    });
    // Stay in sync with sign-in, sign-out, token refresh and expiry.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => { active = false; sub.subscription.unsubscribe(); };
  }, []);

  const need = () => { if (!isSupabaseConfigured) throw new Error(CONFIG_MESSAGE); };

  /** Returns { needsConfirmation }. Throws the real Supabase error on failure (no fake success). */
  const signUp = useCallback(async (email, password) => {
    need();
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
        // Pending-consent: stored with this registration; a database trigger copies it into "consents".
        data: { accepted_policy_version: POLICY_VERSION },
      },
    });
    if (error) throw error;
    // With email confirmation on, Supabase hides duplicates by returning a user with no identities.
    if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      throw new Error('This email is already registered. Try logging in or resetting your password.');
    }
    return { needsConfirmation: !data.session };
  }, []);

  const signIn = useCallback(async (email, password) => {
    need();
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    need();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }, []);

  const requestPasswordReset = useCallback(async (email) => {
    need();
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/reset-password` });
    if (error) throw error;
  }, []);

  const updatePassword = useCallback(async (password) => {
    need();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  }, []);

  const value = { session, user: session?.user ?? null, loading, signUp, signIn, signOut, requestPasswordReset, updatePassword };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
