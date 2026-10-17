# 15 likely defense questions (with simple answers)
Rewrite the answers in your own words and make sure they are true for YOUR final version.

1. **What problem does EdiSubmit solve?** Students juggle many requirements and deadlines; EdiSubmit puts them in one organized place so fewer things are missed or rushed.
2. **Who are the users?** College students who need to track assignments, quizzes, projects and exams on laptop or phone.
3. **What are the main features?** Login, task manager, dashboard, calendar, deadline center, planner, focus timer, analytics, privacy agreement.
4. **Why React and Vite?** React builds the UI from reusable components and keeps screens in sync with data; Vite is a fast dev server and build tool.
5. **Why Tailwind?** Utility classes plus CSS variables let me build a consistent purple theme with a real light/dark switch.
6. **What is PostgreSQL and why Supabase?** PostgreSQL is a relational database; Supabase gives a hosted Postgres plus login (Auth) with a free plan, so I did not have to write a server.
7. **How does authentication work?** Supabase Auth handles passwords and sessions. The app keeps the session after refresh and blocks private routes when signed out. My tables never store passwords.
8. **What is RLS?** Row Level Security is a database rule: each policy says a user may only read/change rows where \`user_id = auth.uid()\`. Even if someone calls the API directly, the database applies the rule.
9. **How did you prove users can't see each other's data?** I did the two-account test (A creates tasks, B can't see them) and recorded the result. [Say what you actually saw.]
10. **How does the privacy agreement work?** The checkbox starts unchecked and registration is blocked until it is ticked. The policy version is sent with the sign-up; a database trigger writes a row in \`consents\` (user id, version, server timestamp). If the record is missing or the policy version changes, the app asks the user again after login. It is a recorded acknowledgement, not a guarantee of legal compliance.
11. **Is your app secure?** It uses HTTPS on Vercel, RLS, input checks in the app and the database, and no secret keys in the frontend. It has not had a professional audit, so I don't claim it is "fully secure".
12. **How do you keep dates correct?** Due dates are plain YYYY-MM-DD values, so timezones can't shift them; "today" comes from the device clock. A completed task is never overdue.
13. **How did you test?** Unit tests for the logic (statistics, overdue, calendar, validation, timer), a manual checklist, and a real phone test. [State real results.]
14. **How is it deployed, and what are the limits?** Code is on GitHub; Vercel's free plan builds and hosts it, and each push redeploys. Supabase's free project can pause after a week of inactivity; Vercel's free plan is for non-commercial use.
15. **How did you use AI, and what did you do yourself?** I used Claude to generate and explain code, then reviewed, ran and tested it, fixed problems and documented them in AI_DEVELOPMENT_LOG.md. [Describe honestly what you personally did.] Future improvements: saved focus history, notifications, CSV export, offline support.
