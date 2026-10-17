import { supabase, isSupabaseConfigured, CONFIG_MESSAGE } from './supabase.js';
import { POLICY_VERSION } from '../config/constants.js';

function client() {
  if (!isSupabaseConfigured) throw new Error(CONFIG_MESSAGE);
  return supabase;
}

/** All consent records of the signed-in user (RLS: only their own). */
export async function listConsents() {
  const { data, error } = await client().from('consents').select('policy_version, agreed_at').order('agreed_at', { ascending: false });
  if (error) throw error;
  return data;
}

/** True only if a row for the CURRENT policy version really exists in the database. */
export async function hasCurrentConsent() {
  const rows = await listConsents();
  return rows.some((r) => r.policy_version === POLICY_VERSION);
}

/** Record agreement to the current policy. The database sets user_id and the timestamp. */
export async function recordConsent() {
  const { error } = await client().from('consents').insert({ policy_version: POLICY_VERSION });
  // 23505 = already recorded for this version; that is fine.
  if (error && error.code !== '23505') throw error;
}
