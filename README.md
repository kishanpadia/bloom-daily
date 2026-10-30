# Bloom

A calm, responsive daily intentions and rewards app. Built without a framework or build step, with an optional Firebase backend.

## Included

- Add/edit daily tasks, effort levels, time estimates, personal completion treats, reminders, and task filters.
- Earn 20/40/60 points based on effort; redeem custom rewards with a preserved claims history.
- Prevent undoing completed tasks when those points have already been spent. Completed tasks stay in the history; their titles can be edited.
- Focus timer with a 25-minute session or a five-minute start, pause/resume, and focus history. The timer runs while the page remains open; a suspended browser may delay its completion alert.
- Real completion-based streaks, a seven-day growth chart, and carry-forward for unfinished tasks on an empty day.
- Device-local persistence, JSON export/restore, reduced-motion support, keyboard-friendly dialogs, and mobile bottom navigation.
- Installable PWA with offline app-shell caching. The first visit must be online. Firebase sign-in and cloud sync require internet access.
- Notification permission controls, test notifications, local reminders, a push-receiving service worker, and a scheduled Firebase function.
- Firebase Email/Password authentication, per-user Firestore rules, and manual conflict choice when cloud data meets unsynced device data.

## Run locally

Requires Node.js 22+ for checks and Python 3 for the preview server.

```sh
npm run dev
```

Open http://localhost:4173. No npm install is needed for the web app.

```sh
npm test
npm run check
```

Deploy the contents of `dist/` to any HTTPS static hosting provider. Keep files at the origin root; the manifest, URLs, and service worker use `/`. The included `.openai/hosting.json` belongs to the current private Sites deployment.

## Connect Firebase later

The app works locally without Firebase. Firebase is not configured or deployed in this delivery.

1. Create or select a Firebase project and register a Web app.
2. Create a Cloud Firestore database in production mode.
3. Enable Authentication → Sign-in method → Email/Password.
4. In Authentication → Settings → Authorized domains, add the deployed hostname. Add `localhost` for development if needed.
5. Deploy the included rules to your project using the Firebase CLI:

```sh
cd firebase
npx firebase-tools login
npx firebase-tools use --add
npx firebase-tools deploy --only firestore:rules,firestore:indexes
```

6. Open Bloom → Settings → Connect Firebase. Paste the **public web configuration JSON**, including `apiKey`, `authDomain`, `projectId`, `messagingSenderId`, and `appId`. This is public client configuration, not an administrative credential. Never use a service account or private key.
7. Create an account or sign in. Your device data will upload if the cloud account is empty. When cloud data and unsaved device changes both exist, choose which version to keep. Export a backup first when switching accounts.

Configuration is saved in that browser. Each browser/device must connect to the same Firebase project before signing in. For a consumer launch, put the public configuration into a checked-in deployment configuration and initialize it automatically instead of asking visitors to configure their own project.

Cloud sync uses one state document per account and the latest saved version. This is a personal tracker, not a collaborative editor. Avoid editing one account on two devices simultaneously. Firestore's 1 MiB document limit applies; archive long histories before approaching that limit. Rules isolate users; points are self-managed encouragement, not money or a security boundary.

## Enable background task notifications

Local notifications need browser permission. Task nudges run every 30 seconds while the page can execute JavaScript and only for tasks due in the last ten minutes. Browser or OS restrictions can delay delivery. Turning the toggle off pauses Bloom reminders; revoke notification permission through browser settings if desired.

For notifications when Bloom is closed:

1. Enable the Firebase Cloud Messaging API and generate a Web Push certificate in Firebase project settings → Cloud Messaging. Copy the **public** VAPID key into Bloom's Firebase settings.
2. The scheduled backend uses Cloud Functions and Cloud Scheduler. This requires the Firebase Blaze plan with billing enabled; review pricing before enabling it.
3. Deploy the function with your own Firebase account:

```sh
cd firebase/functions
npm install
cd ..
npx firebase-tools deploy --only functions:gentleNudges
```

4. Sign in to Bloom and switch device notifications on. If they were already on before connecting Firebase, switch them off and on again to register this browser's push token.
5. Add a future task reminder. Keep the app open until the status says Synced, then close it and test delivery. The function checks due reminders every five minutes, so delivery is approximate. Due times use the device's local timezone when saved. Refresh/resave reminders after traveling between timezones.

The function checks the task is still incomplete and notifications are still enabled, uses a delivery receipt to suppress repeat sends for the same reminder schedule, and removes invalid device tokens. Notification delivery depends on network, browser, OS, and FCM and is not guaranteed. Local and cloud delivery can overlap near the reminder time. FCM data messages are handled by the included shared service worker. Authenticated sign-out removes the current browser's cloud token when online.

On iPhone/iPad, open in Safari, Add to Home Screen, then allow notifications from the installed app if supported by the OS. On Android/desktop, use Chrome or Edge's install option. A private Sites login or embedded preview may restrict service-worker/installation behavior; test the final consumer deployment in a normal browser.

## Launch status and validation

The Site is owner-private. Publication of the review preview was explicitly approved. Public audience/access, a consumer-facing Firebase configuration, and Firebase backend deployment still need your explicit project setup before inviting users.

Six model tests cover task points/undo, spending protection, immutable reward history, streak behavior, backup validation, and local date boundaries. Syntax checks cover browser and function source. Browser QA covers desktop and 390 px mobile layouts, task creation, completion, reward redemption, spent-point protection, navigation, timer controls, and reload persistence. Cloud authentication, Firestore rules, real push delivery, OS installation, and offline behavior have not been verified against a configured Firebase project or installed device.

## References

- [Firebase web setup](https://firebase.google.com/docs/web/setup)
- [Email and password authentication](https://firebase.google.com/docs/auth/web/password-auth)
- [Cloud Messaging web setup](https://firebase.google.com/docs/cloud-messaging/web/get-started)
- [Scheduled functions](https://firebase.google.com/docs/functions/schedule-functions)

