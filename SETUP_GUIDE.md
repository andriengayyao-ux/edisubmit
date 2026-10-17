# EdiSubmit — Setup, Test & Deploy Guide (Windows / PowerShell)

> Everything below uses `npm.cmd` so PowerShell's execution policy never blocks you.
> Menu names on Supabase / Vercel / GitHub websites change now and then. If a button has a slightly different label, look for the closest match.

## 0. What you need
- Node.js **20.19+ or 22.12+** → check with `node -v`
- VS Code, a GitHub account, and (later) free Supabase and Vercel accounts

## 1. Run it locally (Step A)
```powershell
cd edisubmit
npm.cmd install
npm.cmd run test:utils     # expect: all test files/tests pass
npm.cmd run build          # expect: "built in ..." and a dist folder
npm.cmd run preview        # opens a local production preview (URL printed in the terminal)
npm.cmd run dev            # normal development server, http://localhost:5173
```
Until you finish section 2 the app shows a yellow "Supabase is not configured" warning. That is intentional: it never fakes a login.

## 2. Supabase (database + login)
> **Free-plan reality check (checked on supabase.com/pricing):** the Free plan includes 500 MB of database, and **free projects are paused after 1 week of inactivity** until you restore them from the dashboard. Open your app at least once in the week before your defense. Limits can change, so re-check the pricing page.

1. Go to **supabase.com** → **Sign up** (GitHub login is fine).
2. **New project** → choose your organization → name it `edisubmit` → **set a database password and save it privately** (password manager). Never put it in code or GitHub → choose a region near the Philippines (e.g., Singapore) → plan: **Free**.
3. Wait for provisioning (a few minutes).
4. Left menu → **SQL Editor** → **New query**.
5. Open `supabase/schema.sql` in VS Code, copy **everything**, paste into the query box, click **Run**.
   - Success looks like: "Success. No rows returned."
   - If you see `relation "auth.users" does not exist` you are not in a Supabase project's SQL Editor.
   - If you see `column ... already exists` or `constraint ... already exists`: the script is meant to be re-runnable; run it again once. If it persists, copy the exact message to your AI assistant.
   - Schema-cache error in the app (`Could not find the 'task_type' column of 'tasks' in the schema cache`): the table existed with old columns. The script's "EXISTING DATABASE REPAIR" part adds the missing columns and the last line (`notify pgrst, 'reload schema'`) refreshes the API cache. Re-run the script, wait ~30 seconds, refresh the app.
6. Verify (run each separately in a new query; the commands are at the bottom of `schema.sql`):
   - tables `tasks` and `consents` exist;
   - `rowsecurity` is `true` for both;
   - policies: 4 for `tasks`, 2 for `consents`;
   - triggers `tasks_before_write_trg`, `consents_set_time_trg`, `on_auth_user_created_consent` exist.
7. **Project Settings → API** (or the "Connect" button): copy the **Project URL** and the **publishable (anon) key**. Do **not** copy the `service_role` / secret key anywhere.
8. In VS Code, copy `.env.example` to a new file named `.env` and fill it:
   ```env
   VITE_SUPABASE_URL=YOUR_PROJECT_URL
   VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
   ```
9. **Stop and restart** `npm.cmd run dev` — Vite only reads `.env` at startup.
10. **Authentication → Providers → Email**: keep Email enabled. "Confirm email" ON is more realistic (the app handles it); OFF is easier for quick testing.
11. **Authentication → URL Configuration**: Site URL `http://localhost:5173` for now. Under **Redirect URLs** add `http://localhost:5173/**`. (You will add your live URLs in section 5.)

Do not say the database is "set up" until steps 5–6 gave the expected results.

## 3. The two-account RLS test (security check)
1. Register account **A** (real email you can open) → create 2–3 tasks → log out.
2. Register account **B** → confirm B's Tasks page is empty and Dashboard shows zeros.
3. As B, create a task. Log out, log in as A → A sees only A's tasks.
4. In Supabase → **Table Editor → tasks** you (the owner) can see all rows; that is normal. The app, using each user's login, must only show their own.
5. Extra: in Supabase SQL Editor run `select user_id, count(*) from tasks group by 1;` — two different user_ids confirms separate ownership.
6. Write the real result in `TESTING_CHECKLIST.md`.

## 4. Test on a real phone (same Wi-Fi)
```powershell
npm.cmd run dev:phone
```
Vite prints a **Network:** address such as `http://192.168.x.x:5173`. Open that on your phone's browser (phone and laptop on the same Wi-Fi). If it doesn't load, Windows Firewall may be blocking Node.js on private networks — allow it when prompted. This address is for development only. For submission you need the deployed HTTPS link (section 5). Remember to add the network URL to Supabase Redirect URLs if you test email links on the phone.

## 5. GitHub → Vercel (public link)
### GitHub (Step B)
```powershell
git status                       # see what exists first
git init                         # only if it says "not a git repository"
git add .
git status                       # CONFIRM .env is NOT listed
git commit -m "EdiSubmit: initial version"
```
Create an empty repository on github.com (no README), then use the commands GitHub shows:
```powershell
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/edisubmit.git   # skip if a remote already exists: git remote -v
git push -u origin main
```
Later changes: `git add .` → `git commit -m "what changed"` → `git push`. Vercel redeploys automatically on every push to `main`.

### Vercel (Step C) — free Hobby plan
1. vercel.com → **Sign Up** with GitHub → **Add New… → Project** → import `edisubmit`.
2. Framework preset **Vite**; build command `npm run build`; output directory `dist` (these are the defaults).
3. **Environment Variables:** add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` (same values as `.env`).
4. **Deploy.** Open the URL Vercel shows. Test `/login`, `/register`, `/privacy`, and press browser refresh on each (the included `vercel.json` makes direct links work).
5. If you change environment variables later, **redeploy** for them to apply.

`PUBLIC WEBSITE URL: [ADD VERIFIED URL HERE]` ← fill in only after you opened it yourself.

Vercel's Hobby plan is meant for personal, non-commercial use: no ads, no selling things on the site. Check Vercel's current terms.

### Supabase redirects (Step E)
Supabase → Authentication → URL Configuration: set **Site URL** to your live link and add it (with `/**`) to **Redirect URLs**, e.g. `https://edisubmit.vercel.app/**`. Add your custom domain too if you get one. Then test sign-up emails and the password-reset link from the live site.

## 6. A name of your own (Step D)
1. **Free Vercel name:** Project → Settings → Domains / General → rename the project to `edisubmit` if available, giving `edisubmit.vercel.app`. Costs nothing. If taken, pick another.
2. **Free student domain:** if you are eligible, the **GitHub Student Developer Pack** (education.github.com/pack) lists domain offers. At the time of checking, the official pack page listed a **Namecheap .me domain for 1 year** and a **.TECH domain for 1 year** (plus others). Apply with your school email/ID at education.github.com; approval is not instant for everyone. Warnings: the offer is **free for the first year only**; check the **renewal price**, switch **auto-renew off** if you don't want to pay in year two, and be careful about adding a payment card. Offers can change, so read the offer page when you claim.
3. **Paid domain:** optional, after the course.
**Attach a domain:** Vercel project → **Settings → Domains → Add** → enter the domain → Vercel shows the **exact DNS records** to add (do not use records from memory or from a tutorial) → add them at your registrar's DNS page → wait (minutes to hours) → Vercel shows "Valid Configuration" and issues HTTPS automatically → add the domain to Supabase redirect URLs.

## 7. Real-device checklist (Step F)
Landing page · register (box enforced) · confirm email · login · create / edit / complete / delete a task · refresh keeps data · calendar on phone · `/privacy` while signed out · refresh on `/tasks` · theme toggle · **Add to Home Screen** (Android Chrome: menu → *Install app / Add to Home screen*; iPhone Safari: Share → *Add to Home Screen*).
Note: EdiSubmit is installable but has **no service worker**, so it does **not** work offline.
