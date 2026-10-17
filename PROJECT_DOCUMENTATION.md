# EdiSubmit — Project Documentation
**Course:** CPP123 – Emerging Technology · Pamantasan ng Cabuyao (PNC–CPE)

## 1. Cover Page Details
- Project title: EdiSubmit — *Reklamo later. Submit first.*
- Student: [YOUR FULL NAME]
- Section: [YOUR SECTION]
- Instructor: [INSTRUCTOR NAME]
- Submission date: [DATE] (deadline: October 25, 2026)
- Developer contact: [DEVELOPER CONTACT EMAIL — REPLACE BEFORE DEPLOYMENT]
- Public website URL: [ADD VERIFIED URL HERE]
- Source code: [GITHUB REPOSITORY URL]

## 2. Website Overview
EdiSubmit is a responsive web app that helps students manage academic requirements. Signed-in users can add and organize tasks, see them on a dashboard and calendar, monitor deadlines, plan study days, run a focus timer and view simple analytics. Data is stored per user in Supabase PostgreSQL. The name comes from the Filipino phrase "edi submit" ("then just submit").
Logo idea (one sentence): an assignment sheet with a check mark (submitted) and a lightning bolt (last-minute, but done) on a purple tile.

## 3. Problem Statement
Students handle many assignments, quizzes, projects and exams across different subjects. Deadlines are scattered across chats, notebooks and memory, which leads to missed or last-minute submissions. [ADD YOUR OWN OBSERVATION OR SURVEY EVIDENCE IF YOU HAVE ANY — do not invent statistics.]

## 4. Purpose and Objectives
- Provide one place to record academic requirements with subject, type, priority, status and due date.
- Show which tasks are overdue, due today, tomorrow or within 7 days.
- Display deadlines on a monthly calendar and help plan study time per day.
- Keep each student's data private to their own account (authentication + Row Level Security).
- Obtain and record acknowledgement of the Privacy Policy at registration.
- Be usable on laptops and phones and be publicly deployed.

## 5. Target Users
College students (first target: students of PNC–CPE) who need a simple tool to track coursework deadlines on a laptop or phone.

## 6. Feature Breakdown
| Feature | What it does | Where |
|---|---|---|
| Authentication | Register, log in/out, session restore, password reset | /register /login /forgot-password /reset-password |
| Privacy agreement | Required unchecked checkbox, policy version + timestamp stored in `consents` | /register, ConsentGate |
| Task manager | Create, view, edit, delete (confirm), status, mark complete, search, filter, sort, "show more" paging | /tasks |
| Dashboard | Totals, status counts, overdue, due today, completion %, upcoming, high priority, recent, weekly chart + text summary | /dashboard |
| Calendar | Monthly grid, month navigation, today highlight, selected-date list, add task for a date, upcoming list | /calendar |
| Deadline center | Overdue / today / tomorrow / 7 days / later / completed | /deadlines |
| Study planner | Assign study day + estimate, weekly summary, overloaded-day warning | /planner |
| Focus timer | Focus/break, start/pause/resume/reset, adjustable lengths, timestamp-based; sessions are NOT saved | /focus |
| Analytics | Completion rate, completed vs pending, weekly completions, by type, by priority | /analytics |
| Profile | Email, theme, privacy acknowledgement records, delete all tasks, account-deletion instructions | /profile |
| Theme + PWA basics | Light/dark toggle (saved in LocalStorage), manifest and icons for Add to Home Screen | whole app |

**Not implemented (honest list):** CSV export, subtasks/notes, browser notifications, offline mode (no service worker), saved focus-session history, automatic account deletion, Google Calendar sync.

## 7. Technology Stack
React 19 · Vite 7 · JavaScript · Tailwind CSS v4 (Vite plugin) · React Router · Lucide icons · Supabase Auth · Supabase PostgreSQL with Row Level Security · Vitest · GitHub · Vercel (Hobby/free).

## 8. AI-Assisted Development Evidence
See **AI_DEVELOPMENT_LOG.md** (prompts, outputs, my review, bugs, fixes, tests). [ADD YOUR OWN REVIEW NOTES. Describe what you changed or learned; do not claim work you did not do.]

## 9. Screenshot Captions
[INSERT SCREENSHOT] Figure 1 – Landing page (light and dark) · Figure 2 – Register page with unchecked privacy box and validation message · Figure 3 – Data Privacy Notice modal · Figure 4 – Dashboard with real data · Figure 5 – Task form and task list · Figure 6 – Calendar (laptop) · Figure 7 – Calendar (phone) · Figure 8 – Deadline center · Figure 9 – Planner with overloaded-day warning · Figure 10 – Supabase Table Editor showing `consents` row · Figure 11 – Vercel deployment · Figure 12 – App opened on a real phone.

## 10. Complete Privacy Policy
*(Generated from the same source file as the live /privacy page: `npm.cmd run export:policy`. Re-generate it if the policy changes.)*

# EdiSubmit Privacy Policy

*Last updated: October 17, 2026 · Version 2026-10-17-v1*

EdiSubmit is a student project built for CPP123 – Emerging Technology at Pamantasan ng Cabuyao. This policy explains in plain language what the app collects and how it is used. It was written with the Philippine Data Privacy Act of 2012 (RA 10173) in mind, but it is not a legal opinion and does not claim full legal compliance.

## 1. Information collected

When you use EdiSubmit, the following information is collected:

- Account information: your email address and password. The password is handled by Supabase Auth; EdiSubmit never stores it in its own tables.
- Academic task data you enter: title, description, subject, task type, priority, status, due date, optional planned date and time estimate, and automatic created, updated and completed timestamps.
- Privacy acknowledgement record: your user ID, the policy version you agreed to, and the date and time of agreement.
- Browser storage on your device: your light/dark theme choice, and the sign-in session that keeps you logged in.

## 2. Why it is collected

- To create your account and let you sign in.
- To save, show, search and organize your tasks, deadlines, calendar, planner and statistics.
- To keep a record that you acknowledged this policy and which version.
- To remember your theme and keep you signed in on your device.

## 3. How your data is stored and processed

Account and task data are stored in a PostgreSQL database managed by Supabase. Each task and acknowledgement record is tied to your user ID.

The database uses Row Level Security (RLS) rules intended to let each signed-in user read and change only their own records. These rules limit access only when they are correctly configured and tested; they are not an absolute guarantee.

## 4. Supabase (authentication and database)

Supabase processes sign-up, sign-in, password-reset emails and the PostgreSQL database that holds your data. Supabase handles data under its own terms and privacy policy. Free-plan projects have usage limits and may be paused when inactive.

## 5. Vercel (website hosting)

The website is hosted on Vercel. As a hosting provider, Vercel may process technical request information (such as IP address and browser details) in order to deliver the site, under its own terms and privacy policy.

## 6. Other services

EdiSubmit’s own code does not include advertising or analytics tools, and it has no feature that sells or shares your task data with advertisers. If a custom domain is used, the domain registrar and its DNS service handle domain registration records and DNS lookups under their own terms. This section will be updated if other services are added.

## 7. Retention and deletion

EdiSubmit has no automatic expiry: your data stays until you delete it or your account is removed. You can delete individual tasks, or all of your tasks from the Profile page, at any time.

Deleting your account (by request, see section 8) also removes your task and acknowledgement records, because they are linked to your account in the database. Copies in Supabase or Vercel backups and logs, if any, follow those providers’ own practices.

## 8. Account deletion requests

To request deletion of your account and data, email the developer at [DEVELOPER CONTACT EMAIL — REPLACE BEFORE DEPLOYMENT] from the email address registered to your account. Deletion is handled manually by the developer; no specific response time is promised.

## 9. Security safeguards and limitations

- Connections to the deployed site use HTTPS.
- Row Level Security is enabled on the database tables that hold user data.
- The frontend contains only the Supabase URL and publishable key; no service-role key or database password is placed in the app.
- No online system is completely secure. This is a student project and has not had a professional security audit.

## 10. Your responsibilities

- Use a strong, unique password and do not share it.
- Do not enter sensitive personal information (such as government IDs or health details) in task fields.
- Sign out on shared computers.

## 11. Contact

For privacy questions or requests, contact the developer: [DEVELOPER CONTACT EMAIL — REPLACE BEFORE DEPLOYMENT].

## 12. Policy updates

This policy was last updated on October 17, 2026 (version 2026-10-17-v1). If it changes materially, the version number changes and signed-in users are asked to acknowledge the new version before continuing to use the app.

## 11. Testing and Deployment
**Automated:** 34 unit tests (`npm.cmd run test:utils`) cover statistics with zero tasks, completion rate, overdue logic, completed-never-overdue, today/tomorrow/7-day buckets, leap years and month navigation across year boundaries, search/filter/sort, task and registration validation (including the unchecked privacy box), timer maths, planner overload, and weekly analytics.
Result on my machine: [PASTE REAL OUTPUT]
**Build:** [PASTE REAL OUTPUT OF npm.cmd run build]
**Manual tests:** see TESTING_CHECKLIST.md. Results: [FILL IN]
**RLS two-account test:** [FILL IN]
**Deployment:** GitHub → Vercel (Hobby). Public URL: [ADD VERIFIED URL HERE]. Custom domain: [NONE / DOMAIN]. Real-phone test: [DEVICE, BROWSER, DATE, RESULT].
**Known limitations:** Supabase free projects pause after a week of inactivity; no offline support; account deletion is manual by email; the privacy checkbox is a recorded acknowledgement, not a guarantee of legal compliance; no professional security audit.

## 12. Reflection and Conclusion
[WRITE IN YOUR OWN WORDS: what you learned about React, PostgreSQL/RLS, authentication, privacy, deployment and working with AI; what was hard; what you would improve next.]
