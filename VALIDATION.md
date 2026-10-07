# Validation

Completed locally:
- JavaScript syntax checks for the app, program, and service worker.
- Six passing Node tests covering day structure/core, two-exposure overload, insufficient effort/partial-session protection, variation/load isolation, recovery/reset rules, and unit conversion.

Not completed:
- Browser interaction, visual layout and offline/PWA installation checks. Chromium download was blocked in this execution environment. `qa.cjs` outside this project records the intended mobile browser checks; it is not part of the deployed app.
- GitHub access: initial permission failures were resolved; the initial README write succeeded through the connector. App upload follows in the next commit.
- GitHub Pages deployment: requires repository access and Pages configured with GitHub Actions as source.

Before relying on the app, validate on Android Chrome: enter a set; switch lb/kg; reload and verify the draft; save a partial session; export/import a backup; install; reopen online once, then confirm it opens offline. The first workout should use conservative loads while learning the progression workflow.
