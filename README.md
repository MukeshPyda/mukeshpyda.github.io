# hmcyberacademy.com

Mukesh Pyda's site: Next.js static export, deployed to GitHub Pages by `.github/workflows/deploy.yml` on every push to `main`.

| Route | What it is |
|---|---|
| `/` | Hero + timeline of workshops (`src/lib/data.ts`) |
| `/intelligence/` | Blog archive; posts in `src/app/intelligence/blogs.json`, images in `public/intelligence/<slug>/` |
| `/courses/` | Public course catalog; course pages at `/courses/view/?c=<course-id>` |
| `/terminal-x-92/` | Admin (Google sign-in): Operations, Blog Maker, Courses, Learners |

## Local development

```bash
npm ci
npm run dev        # http://127.0.0.1:3000 (bound to this machine only)
npm run lint
npm run build      # static site in out/
```

## Writing blog posts (Blog Maker)

1. `npm run dev`, open http://127.0.0.1:3000/terminal-x-92/ → **Blog Maker**.
2. Fill in title, date, tags, summary, YouTube link, main image and the lab steps (description, code, images). **Preview** shows the real post page.
3. **Publish to archive** writes `blogs.json` and the images. Reorder or delete posts from the list.
4. Commit and push to publish.

Operations (timeline events) works the same way. Saving only works on the local dev server; the save API refuses any request that is not from this machine.

## Courses and learners (Firebase)

Course content and enrollment live in Firebase (free Spark plan): Google sign-in + Firestore. The security rules decide who can read what, so the site itself can stay a static GitHub Pages site.

One-time setup:

1. Create the Firebase project, enable **Authentication → Google**, add `hmcyberacademy.com` and `www.hmcyberacademy.com` under Authorized domains, and create **Firestore** (production mode).
2. Paste the web app config into `src/lib/firebase/config.ts` (it is public by design).
3. Generate the rules with the admin email and publish them in Firestore → Rules:
   ```bash
   npm run rules -- <admin email>
   ```
   `firestore.rules` is git-ignored so the admin email never reaches the public repo; only `firestore.rules.template` is committed.

Day to day, in `/terminal-x-92/` (works from any device once signed in):

- **Courses**: modules of YouTube videos (set them to *Unlisted*) and PDFs (up to 20 MB, stored in Firestore), price in USD, enrolled-only links, publish toggle.
- **Learners**: approve "Request access" requests, grant access by email, revoke access.

### Running a live cohort

1. **Courses → New course**: title, price, then the **Live cohort** box: format, start/end dates, **Enroll by**, class days, class times (in the course time zone, default `Asia/Kolkata`) and **Seats**.
2. **Bulk add modules & lessons**: paste one item per line, e.g.
   ```
   # Week 1 · Foundations
   2026-11-02 | Orientation & setup
   2026-11-03 | Networking I
   ```
   Each dated line becomes a live session. Add PDFs per module with **Add PDF**.
3. Add the Discord / Telegram invites under **Links for enrolled learners**, save as a draft, check the public page, then publish.
4. After each class, paste the unlisted YouTube recording into that session's **Recording link** and save.

The course page shows class times in IST and in the visitor's own time zone, "X of N seats left" (updated when you approve or remove learners in **Learners**), and switches to "Enrollment closed" after the enroll-by date (23:59 in the course time zone) or "Batch full" when the seats are taken.

## Testing against the Firebase emulators

```bash
npx firebase-tools emulators:start --only firestore,auth --project demo-hmca   # needs Java
NEXT_PUBLIC_FIREBASE_EMULATOR=1 npm run dev
```

`firebase.json` points the emulators at `firestore.rules` on the ports the app expects. Generate the rules for a test admin first (`npm run rules -- admin@example.com`, then regenerate with the real email before publishing). The emulator sign-in popup lets you create fake Google accounts.
