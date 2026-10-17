# EdiSubmit — Testing checklist
Mark each item only after you really did it. Write the date and what you saw. **Pending** means not done yet.

## A. Automated (npm.cmd run test:utils)
| Check | Result |
|---|---|
| Unit tests (34 tests in `src/utils/__tests__/utils.test.js`) on my laptop with real Vitest | PENDING — paste output |
| Production build `npm.cmd run build` | PENDING — paste output |

## B. Manual tests
| # | Test | Expected | Result / date |
|---|---|---|---|
| 1 | Open `/register`, leave box unchecked, submit | Message "You must agree…" and no account created | PENDING |
| 2 | Open the Privacy Policy link, return, submit without ticking | Still blocked (opening ≠ agreeing) | PENDING |
| 3 | Register with valid data and box ticked | Success or "check your email" (if confirmation is on) | PENDING |
| 4 | Register with an already-used email | Real error / "already registered", no success | PENDING |
| 5 | Supabase → Table Editor → `consents` | One row for the new user with the current policy version and a timestamp | PENDING |
| 6 | Bump `POLICY_VERSION`, log in again | "Privacy Policy acknowledgement needed" screen appears; agreeing adds a new row | PENDING |
| 7 | Login wrong password | Real error shown | PENDING |
| 8 | Refresh while logged in | Still logged in | PENDING |
| 9 | Logout, open `/dashboard` | Redirected to `/login` | PENDING |
| 10 | Forgot password → email → link → new password | Can log in with the new password | PENDING |
| 11 | Create task (missing title/subject/date) | Field errors, nothing saved | PENDING |
| 12 | Create, edit, change status, complete, delete (confirm dialog) | Each works; refresh keeps the change | PENDING |
| 13 | Search / filter / sort on `/tasks` | Matches the unit-test behavior | PENDING |
| 14 | Dashboard numbers vs. real tasks | Totals, overdue, % match what you count by hand | PENDING |
| 15 | Completed task with a past due date | Not shown as overdue | PENDING |
| 16 | Calendar: next/prev across Dec→Jan, Feb 2028 (29 days), today highlight | Correct | PENDING |
| 17 | Calendar: select a date → Add task → due date prefilled | Works | PENDING |
| 18 | Deadlines groups (today, tomorrow, 7 days, overdue) | Correct grouping | PENDING |
| 19 | Planner: plan tasks, add >240 min on one day | "Overloaded" warning | PENDING |
| 20 | Focus timer: start, pause, resume, reset; lock phone 1 min while running | Time still correct on return | PENDING |
| 21 | Analytics with 0 tasks and with tasks | Empty state, then real numbers; no errors | PENDING |
| 22 | RLS two-account test (SETUP_GUIDE section 3) | B never sees A's data | PENDING |
| 23 | `/privacy` and login "Data Privacy Notice" while signed out | Readable; modal closes with Esc and X | PENDING |
| 24 | Theme toggle persists after refresh | Yes | PENDING |
| 25 | Phone widths 360/390/768 px; no sideways scrolling | OK | PENDING |
| 26 | Keyboard only: Tab through login, open/close a modal | Focus visible, trapped in modal, returns after close | PENDING |
| 27 | Refresh directly on `/calendar` on the deployed site | Page loads (no 404) | PENDING |
| 28 | Pause Supabase env vars (rename `.env`), restart | Clear "not configured" warning, no fake login | PENDING |
