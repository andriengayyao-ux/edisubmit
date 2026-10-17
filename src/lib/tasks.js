import { supabase, isSupabaseConfigured, CONFIG_MESSAGE } from './supabase.js';

// Only these fields are ever sent to the database (user_id is filled in by the database from auth.uid()).
const FIELDS = ['title', 'description', 'subject', 'task_type', 'priority', 'status', 'due_date', 'planned_date', 'estimated_minutes'];

function client() {
  if (!isSupabaseConfigured) throw new Error(CONFIG_MESSAGE);
  return supabase;
}

/** Clean form values into the exact column names/types the database expects. */
export function toPayload(values) {
  const p = {};
  for (const f of FIELDS) if (f in values) p[f] = values[f];
  if ('title' in p) p.title = p.title.trim();
  if ('subject' in p) p.subject = p.subject.trim();
  if ('description' in p) p.description = p.description?.trim() ? p.description.trim() : null;
  if ('planned_date' in p) p.planned_date = p.planned_date || null;
  if ('estimated_minutes' in p) {
    p.estimated_minutes = p.estimated_minutes === '' || p.estimated_minutes == null ? null : Number(p.estimated_minutes);
  }
  return p;
}

export async function listTasks() {
  const { data, error } = await client().from('tasks').select('*').order('due_date', { ascending: true });
  if (error) throw error;
  return data;
}

export async function createTask(values) {
  const { data, error } = await client().from('tasks').insert(toPayload(values)).select().single();
  if (error) throw error;
  return data;
}

export async function updateTask(id, values) {
  const { data, error } = await client().from('tasks').update(toPayload(values)).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteTask(id) {
  const { error } = await client().from('tasks').delete().eq('id', id);
  if (error) throw error;
}

/** Deletes every task of the signed-in user (RLS guarantees only their own rows can match). */
export async function deleteAllTasks() {
  const { error } = await client().from('tasks').delete().not('id', 'is', null);
  if (error) throw error;
}
