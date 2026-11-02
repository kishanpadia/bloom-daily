# Bloom

A public daily intentions and rewards web app, connected to its own Firebase project.

**Web app:** https://bloomdaily.web.app

**GitHub source:** https://github.com/kishanpadia/bloom-daily (public)

**Firebase project:** `bloom-daily-311026` (separate from Penny)

## Accounts and privacy

- Email/password account creation and sign-in.
- Google sign-in through Firebase Authentication.
- Email accounts must verify their email before the tracker or cloud data becomes available. Firestore rules also enforce `email_verified == true`; hiding screens is not the access control.
- Verification email resend with a cooldown, a check-verification button that refreshes the Firebase token, and a recovery form for pasting a verification link.
- The recovery form only accepts Bloom’s own or Firebase auth domain, verifies the action type and signed-in email, and never saves the link.
- Password reset through Firebase’s standard email handler. The application also handles valid verification and password-reset action URLs if routed to it.
- New and reset passwords must have 12–128 characters; the server enforces this policy. Email enumeration protection is enabled.
- Session-only sign-in by default. Remember me explicitly enables persistent sign-in.
- Each account has private Firestore records and a separate local cache. Sign-out clears the active tracker from the UI. A previous device-only plan is imported only after an explicit choice.
- No service-account credentials or administrative tokens are shipped. `dist/firebase-config.js` contains the public web configuration, as intended by Firebase.

## Daily experience

- Daily tasks, effort levels, time estimates, optional personal treats, and reminders.
- 20/40/60 points for task effort, custom rewards, and reward history. Spent points cannot be reused by undoing a completion.
- Focus timer, real completion-based streaks, seven-day growth chart, and carry-forward of unfinished tasks.
- Export/restore of a JSON backup. Responsive layouts and reduced-motion support.
- Installable PWA. Sign-in and cloud sync require internet access. Browser caching and session availability affect offline access; the app keeps an account’s latest saved device data for recovery when possible.

## Run and test

The app has no frontend build step. Requires Python 3 for preview, Node.js 22+ for checks, and the Firebase CLI for emulator/backend commands.

```sh
npm run dev
```

Open http://localhost:4173. Local production-auth sign-in is intentionally not authorized: the Firebase authorized-domain list is limited to the public app and Firebase helper domains. Use emulators for local account testing.

```sh
npm install
npm test
npm run check
cd firebase
firebase emulators:start --only auth,firestore --project demo-bloom
```

In another terminal, run `npm run test:firebase` from the app root. The four emulator integration checks cover unverified/forged claims, ownership isolation, token/reminder privacy, and the full email signup/verification/sign-in/reset flow. Open http://localhost:4173/?emulators=1 to use the browser UI against emulators on localhost. This switch only works on localhost or 127.0.0.1 and uses `demo-bloom`; the published app cannot connect to these test services.

There are 10 unit checks plus 4 backend integration checks. Browser QA covers the public welcome and account forms, verification gating and untrusted-link rejection, task saving, sign-out, and re-sign-in with persisted progress. Real inbox delivery and a full Google account login require a user completing those flows; automated verification uses isolated emulator accounts.

## Backend administration

Authentication providers are configured in `firebase/firebase.json`. Firestore is in `asia-south1` on the free-tier standard database. The deployed rules require a verified owner for private user documents. State-collection enumeration and unrelated paths are denied. Device and reminder collection queries are available only to their verified owner.

To redeploy rules and indexes:

```sh
cd firebase
firebase deploy --only firestore:rules,firestore:indexes --project bloom-daily-311026
```

Google sign-in is enabled with the Firebase helper redirect at `https://bloom-daily-311026.firebaseapp.com/__/auth/handler`. The production app hostname is authorized. Standard Firebase verification/password-reset emails return users to Bloom through action settings. A request to override the project email-template action URL was rejected by Firebase (`EMAIL_TEMPLATE_UPDATE_NOT_ALLOWED`), so the standard handler is retained; both standard helper endpoints were verified reachable.

State sync uses one document per account and the latest saved version. Avoid editing one account on two devices at the same time. Unsynced device changes meeting cloud data trigger a choice of which version to keep. Export a backup before switching versions. Firestore’s 1 MiB document limit applies. Points are personal motivation, not money or a security boundary.

## Notifications

Permission-based test notifications, focus-completion alerts, and task nudges work while the app can execute. Browser and OS restrictions can delay them. Background scheduled reminders are **not deployed**. Their optional Firebase function is included under `firebase/functions/`; deploying it requires billing-enabled Cloud Functions/Cloud Scheduler and FCM configuration. No billing plan was upgraded for this release.

## Deployment

The public app is deployed to Firebase Hosting at **https://bloomdaily.web.app**. The Hosting site is `bloomdaily` in the existing `bloom-daily-311026` Firebase project. It uses the same Authentication and Firestore data as the original deployment. Keep `dist/` at the origin root; `firebase/firebase.json` points Hosting to that directory.

After validating and pushing an update to GitHub, deploy the exact committed source:

```sh
cd firebase
firebase deploy --only hosting --project bloom-daily-311026
```

Hosting responses revalidate cached files so updates can be picked up promptly. The service worker keeps the app shell for offline recovery. Source, rules, and tests are included in the downloadable source archive; dependencies and local emulator state are excluded. `.openai/hosting.json` retains the legacy Site identity for existing links; Firebase Hosting is the primary public address.

## GitHub update workflow

GitHub is the source of truth for all Bloom updates. The canonical local checkout is the dedicated `bloom` folder, with GitHub configured as `origin` and `main` tracking `origin/main`.

For each completed update, review and validate the changes, create a descriptive commit, and push it to GitHub before publishing the application. `AGENTS.md` records this workflow for future coding sessions. Preserve existing user edits and do not rewrite shared history.

Application source changes are then published to Firebase Hosting from the same source commit. A GitHub push alone does not automatically deploy the web app. Repository settings and documentation-only updates do not require an app redeployment.

## References

- https://firebase.google.com/docs/auth/web/manage-users
- https://firebase.google.com/docs/auth/web/google-signin
- https://firebase.google.com/docs/auth/web/password-auth
- https://firebase.google.com/docs/firestore/security/get-started
