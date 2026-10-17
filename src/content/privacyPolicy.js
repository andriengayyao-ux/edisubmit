// SINGLE SOURCE for the privacy policy. Used by /privacy, the Data Privacy Notice modal,
// the register page and PROJECT_DOCUMENTATION.md (via `npm.cmd run export:policy`).
// Only describe what the code really does. If you add a feature that stores new data, update this file
// AND bump POLICY_VERSION in src/config/constants.js.
import { APP_NAME, CONTACT_EMAIL, POLICY_LAST_UPDATED, POLICY_VERSION } from '../config/constants.js';

export const policyMeta = { title: `${APP_NAME} Privacy Policy`, lastUpdated: POLICY_LAST_UPDATED, version: POLICY_VERSION };

export const policyIntro =
  `${APP_NAME} is a student project built for CPP123 – Emerging Technology at Pamantasan ng Cabuyao. ` +
  'This policy explains in plain language what the app collects and how it is used. It was written with the ' +
  'Philippine Data Privacy Act of 2012 (RA 10173) in mind, but it is not a legal opinion and does not claim full legal compliance.';

// Each section: { id, title, paragraphs?: string[], bullets?: string[] }
export const policySections = [
  {
    id: 'collected', title: '1. Information collected',
    paragraphs: ['When you use EdiSubmit, the following information is collected:'],
    bullets: [
      'Account information: your email address and password. The password is handled by Supabase Auth; EdiSubmit never stores it in its own tables.',
      'Academic task data you enter: title, description, subject, task type, priority, status, due date, optional planned date and time estimate, and automatic created, updated and completed timestamps.',
      'Privacy acknowledgement record: your user ID, the policy version you agreed to, and the date and time of agreement.',
      'Browser storage on your device: your light/dark theme choice, and the sign-in session that keeps you logged in.',
    ],
  },
  {
    id: 'purpose', title: '2. Why it is collected',
    bullets: [
      'To create your account and let you sign in.',
      'To save, show, search and organize your tasks, deadlines, calendar, planner and statistics.',
      'To keep a record that you acknowledged this policy and which version.',
      'To remember your theme and keep you signed in on your device.',
    ],
  },
  {
    id: 'storage', title: '3. How your data is stored and processed',
    paragraphs: [
      'Account and task data are stored in a PostgreSQL database managed by Supabase. Each task and acknowledgement record is tied to your user ID.',
      'The database uses Row Level Security (RLS) rules intended to let each signed-in user read and change only their own records. These rules limit access only when they are correctly configured and tested; they are not an absolute guarantee.',
    ],
  },
  {
    id: 'supabase', title: '4. Supabase (authentication and database)',
    paragraphs: [
      'Supabase processes sign-up, sign-in, password-reset emails and the PostgreSQL database that holds your data. Supabase handles data under its own terms and privacy policy. Free-plan projects have usage limits and may be paused when inactive.',
    ],
  },
  {
    id: 'vercel', title: '5. Vercel (website hosting)',
    paragraphs: [
      'The website is hosted on Vercel. As a hosting provider, Vercel may process technical request information (such as IP address and browser details) in order to deliver the site, under its own terms and privacy policy.',
    ],
  },
  {
    id: 'others', title: '6. Other services',
    paragraphs: [
      'EdiSubmit’s own code does not include advertising or analytics tools, and it has no feature that sells or shares your task data with advertisers. If a custom domain is used, the domain registrar and its DNS service handle domain registration records and DNS lookups under their own terms. This section will be updated if other services are added.',
    ],
  },
  {
    id: 'retention', title: '7. Retention and deletion',
    paragraphs: [
      'EdiSubmit has no automatic expiry: your data stays until you delete it or your account is removed. You can delete individual tasks, or all of your tasks from the Profile page, at any time.',
      'Deleting your account (by request, see section 8) also removes your task and acknowledgement records, because they are linked to your account in the database. Copies in Supabase or Vercel backups and logs, if any, follow those providers’ own practices.',
    ],
  },
  {
    id: 'deletion', title: '8. Account deletion requests',
    paragraphs: [
      `To request deletion of your account and data, email the developer at ${CONTACT_EMAIL} from the email address registered to your account. Deletion is handled manually by the developer; no specific response time is promised.`,
    ],
  },
  {
    id: 'security', title: '9. Security safeguards and limitations',
    bullets: [
      'Connections to the deployed site use HTTPS.',
      'Row Level Security is enabled on the database tables that hold user data.',
      'The frontend contains only the Supabase URL and publishable key; no service-role key or database password is placed in the app.',
      'No online system is completely secure. This is a student project and has not had a professional security audit.',
    ],
  },
  {
    id: 'responsibilities', title: '10. Your responsibilities',
    bullets: [
      'Use a strong, unique password and do not share it.',
      'Do not enter sensitive personal information (such as government IDs or health details) in task fields.',
      'Sign out on shared computers.',
    ],
  },
  {
    id: 'contact', title: '11. Contact',
    paragraphs: [`For privacy questions or requests, contact the developer: ${CONTACT_EMAIL}.`],
  },
  {
    id: 'updates', title: '12. Policy updates',
    paragraphs: [
      `This policy was last updated on ${POLICY_LAST_UPDATED} (version ${POLICY_VERSION}). If it changes materially, the version number changes and signed-in users are asked to acknowledge the new version before continuing to use the app.`,
    ],
  },
];

// Short version shown in the login "Data Privacy Notice" modal.
export const noticePoints = [
  'What we collect: your email, your password (handled by Supabase Auth), the tasks you enter, and a record that you acknowledged this policy.',
  'Why: to let you sign in and to save and organize your academic tasks and deadlines.',
  'Who processes it: Supabase handles sign-in and the PostgreSQL database; Vercel hosts the website.',
  'Your tasks are protected by Row Level Security rules meant to limit access to your own records.',
  `Deletion: email ${CONTACT_EMAIL} to request account deletion, or delete your tasks yourself on the Profile page.`,
];

/** Plain-markdown copy of the policy (used for PROJECT_DOCUMENTATION.md). */
export function policyToMarkdown() {
  const lines = [`# ${policyMeta.title}`, '', `*Last updated: ${policyMeta.lastUpdated} · Version ${policyMeta.version}*`, '', policyIntro, ''];
  for (const s of policySections) {
    lines.push(`## ${s.title}`, '');
    (s.paragraphs || []).forEach((p) => lines.push(p, ''));
    (s.bullets || []).forEach((b) => lines.push(`- ${b}`));
    if (s.bullets) lines.push('');
  }
  return lines.join('\n');
}
