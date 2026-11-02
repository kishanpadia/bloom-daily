# Bloom project workflow

## Source of truth

- Work from this repository root, the canonical Bloom project folder. Do not make new changes in an older scratch copy.
- The primary source repository is https://github.com/kishanpadia/bloom-daily, with `origin` as its Git remote and `main` as its default branch.
- Keep every completed project update in GitHub: review the diff, run checks appropriate to the changes, create a descriptive commit, and push it to GitHub. The user has authorized this workflow. Report any push failure instead of implying it succeeded.
- Before starting an update, fetch `origin` and inspect the working tree. Preserve user changes. Fast-forward clean branches when needed; never force-push, discard work, or rewrite shared history without explicit authorization.

## Validation and publishing

- For application changes, run `npm test` and `npm run check`. For authentication or database-rule changes, also run `npm run test:firebase` against the isolated Firebase emulators. Documentation-only edits need a diff review and whitespace check.
- Push the completed source commit to GitHub before publishing an application update. Use the Sites skill for the existing Site, preserve `.openai/hosting.json`, and synchronize that same commit to its hosting source repository as required by the publishing workflow.
- A push to GitHub does not automatically deploy the Site. Complete and verify the Sites deployment for app changes unless the user requests source-only work. Repository administration and documentation-only changes do not require an unchanged app to be redeployed.
- GitHub and the web app are public at the user's request. Firebase records must remain private to their verified owner; public repository or Site access never changes the database rules.

## Project files

- `dist/` contains the web app; `firebase/` contains backend rules, configuration, and optional functions; `tests/` contains automated checks.
- Firebase web configuration is public client configuration. Never commit administrative tokens, service-account private keys, `.env` files, local emulator state, dependency directories, or debug logs.
- Keep generated handoff files in the local `downloads/` folder and out of commits. Refresh source archives when delivering a new downloadable package.
