import { LIMITS, PRIORITIES, STATUSES, TASK_TYPES } from '../config/constants.js';
import { isValidISODate } from './dates.js';

/** Returns an object of { field: message }. Empty object = valid. The database enforces the same rules. */
export function validateTask(v) {
  const e = {};
  const title = (v.title || '').trim();
  const subject = (v.subject || '').trim();
  if (!title) e.title = 'Title is required.';
  else if (title.length > LIMITS.title) e.title = `Title must be ${LIMITS.title} characters or fewer.`;
  if (!subject) e.subject = 'Subject is required.';
  else if (subject.length > LIMITS.subject) e.subject = `Subject must be ${LIMITS.subject} characters or fewer.`;
  if ((v.description || '').length > LIMITS.description) e.description = `Description must be ${LIMITS.description} characters or fewer.`;
  if (!v.due_date) e.due_date = 'Due date is required.';
  else if (!isValidISODate(v.due_date)) e.due_date = 'Enter a valid date.';
  if (v.planned_date && !isValidISODate(v.planned_date)) e.planned_date = 'Enter a valid date.';
  if (!TASK_TYPES.includes(v.task_type)) e.task_type = 'Choose a task type.';
  if (!PRIORITIES.includes(v.priority)) e.priority = 'Choose a priority.';
  if (!STATUSES.includes(v.status)) e.status = 'Choose a status.';
  if (v.estimated_minutes !== '' && v.estimated_minutes != null) {
    const n = Number(v.estimated_minutes);
    if (!Number.isInteger(n) || n < LIMITS.minMinutes || n > LIMITS.maxMinutes) {
      e.estimated_minutes = `Estimate must be a whole number from ${LIMITS.minMinutes} to ${LIMITS.maxMinutes} minutes.`;
    }
  }
  return e;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MIN_PASSWORD = 8;

export function validateRegistration({ email, password, confirmPassword, agreed }) {
  const e = {};
  if (!EMAIL_RE.test((email || '').trim())) e.email = 'Enter a valid email address.';
  if (!password || password.length < MIN_PASSWORD) e.password = `Password must be at least ${MIN_PASSWORD} characters.`;
  if (password !== confirmPassword) e.confirmPassword = 'Passwords do not match.';
  if (agreed !== true) e.agreed = 'You must agree to the Privacy Policy before creating an account.';
  return e;
}

export function validateLogin({ email, password }) {
  const e = {};
  if (!EMAIL_RE.test((email || '').trim())) e.email = 'Enter a valid email address.';
  if (!password) e.password = 'Enter your password.';
  return e;
}
