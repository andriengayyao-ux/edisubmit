# AI Development Log — EdiSubmit
Keep this honest: only record what really happened. Add a new entry every time you prompt the AI.

## Entry 1
- **Date:** October 17, 2026
- **AI tool used:** Claude (claude.ai chat, with a sandboxed file environment that had **no internet access**)
- **Exact prompt:** [PASTE YOUR FULL "MASTER PROMPT" TEXT HERE — the exact text you sent. Also keep the earlier V2 master prompt if you used it.]
- **Output summary:** Generated the project `edisubmit`: Vite/React/Tailwind v4 setup; purple light/dark design system; SVG logo + PNG icons + PWA manifest; routes and layouts; landing page; Supabase auth with required privacy checkbox; shared privacy-policy source; `consents` table with RLS and a database trigger that copies the accepted policy version at sign-up; tasks CRUD with validation; dashboard, calendar, deadlines, planner, focus timer, analytics, profile; `supabase/schema.sql`; 34 unit tests; setup guide, testing checklist, documentation, defense questions.
- **Tests the AI actually ran (in its sandbox):**
  - 34 unit tests in `src/utils/__tests__/utils.test.js` — **34 passed**, but run with a small stand-in for Vitest (node:test), because packages could not be installed offline. Real Vitest run: [PENDING — paste your result].
  - A rough static check that every relative import points to an existing file/export and brackets balance — 0 problems found. This is **not** a compile.
  - `npm install`, `npm run build`, the dev server, any browser test, any Supabase call, and deployment were **NOT run** by the AI.
- **My review and changes:** [WRITE WHAT YOU CHECKED, CHANGED, OR DIDN'T UNDERSTAND]
- **Bugs and fixes found during AI work:** (1) Field/Sel helper components were first defined inside component bodies, which would remount inputs on every keystroke; moved outside. (2) Focus timer could count one session twice; guarded with an end-timestamp check. (3) Tailwind v4 requires `@utility` for classes that other classes `@apply`; CSS changed accordingly.
- **Bugs found by me:** [FILL IN AS YOU TEST]
- **Actual results of my own tests:** [FILL IN]

## Entry 2
- **Date:** 
- **Prompt:** 
- **Output summary:** 
- **My review and changes:** 
- **Bugs / fixes:** 
- **Tests and real results:** 
