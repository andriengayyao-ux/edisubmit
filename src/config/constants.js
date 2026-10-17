// Central place for app-wide constants. Change contact / policy version HERE only.
export const APP_NAME = 'EdiSubmit';
export const TAGLINE = 'Reklamo later. Submit first.';
export const DESCRIPTOR = 'Manage requirements, deadlines, and academic tasks.';

// TODO before deployment: replace with your real email.
export const CONTACT_EMAIL = '[DEVELOPER CONTACT EMAIL — REPLACE BEFORE DEPLOYMENT]';

// Bump POLICY_VERSION whenever the privacy policy changes materially.
// Every signed-in user is then asked to acknowledge the new version (see ConsentGate).
export const POLICY_VERSION = '2026-10-17-v1';
export const POLICY_LAST_UPDATED = 'October 17, 2026';

export const TASK_TYPES = ['Assignment', 'Project', 'Quiz', 'Examination', 'Research', 'Presentation', 'Other'];
export const PRIORITIES = ['low', 'medium', 'high'];
export const STATUSES = ['todo', 'in_progress', 'completed'];

// Display labels. The database stores the keys on the left.
// Want "Submitted" instead of "Completed"? Change the label here.
export const STATUS_LABELS = { todo: 'To Do', in_progress: 'In Progress', completed: 'Completed' };
export const PRIORITY_LABELS = { low: 'Low', medium: 'Medium', high: 'High' };
export const PRIORITY_RANK = { low: 1, medium: 2, high: 3 };

export const LIMITS = { title: 120, subject: 80, description: 2000, minMinutes: 5, maxMinutes: 1440 };
export const OVERLOAD_MINUTES = 240; // a planned day above this many minutes is flagged "overloaded"
export const THEME_KEY = 'edisubmit-theme';
