/** Turn a Supabase/PostgREST error into a message a student can act on. Always keeps the real reason. */
export function friendlyError(error, fallback = 'Something went wrong.') {
  if (!error) return fallback;
  const msg = error.message || String(error);
  if (/schema cache|does not exist|relation .* does not exist/i.test(msg)) {
    return `${msg} — The database tables look out of date. Run supabase/schema.sql in the Supabase SQL Editor (see SETUP_GUIDE.md).`;
  }
  if (/row-level security/i.test(msg)) return `${msg} — The database refused this action (security rule).`;
  if (/failed to fetch|networkerror/i.test(msg)) return 'Network problem: could not reach Supabase. Check your internet connection.';
  return msg;
}
