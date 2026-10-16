# Validation

JavaScript syntax checks and 13 Node tests pass. Coverage includes configuration edits/additions/order, invalid-plan rejection, planned weekly volume, RIR-specific progression, overload/partial-session protection, unit conversion, recovery exclusions, warm-up saving/validation, warm-up-only sessions, old backups and history compatibility after changing exercises.

Browser visual/interaction and Android install checks remain unverified in this environment because the Chromium download was blocked. On-device checks: add/check a warm-up, log work sets, save, view the journal, change lb/kg, export/import, and reopen offline after an online visit.

Source and deployment use GitHub Actions. The initial app deployed successfully after Pages was enabled; subsequent commits run the same checks and deployment workflow. Warm-ups are stored separately and do not earn work-set progression credit.

## Personal program import/export (2026-10-16)

- `npm run check` and all 35 Node tests pass.
- Added validation/round-trip coverage for 1–7 days, optional/custom/generated names, malformed JSON, oversized files, unsafe identifiers, invalid prescriptions, failed storage writes and missing/corrupt overrides.
- App-flow tests cover journal and draft preservation, cancelled/invalid imports, restoring drafts by configuration, four-day advancement/wraparound and weekly celebration, one-day wraparound, seven-day rendering, escaped imported text, and journal backup compatibility.
- Default configuration remains unchanged. Versioned asset URLs and the service-worker cache were bumped for the release.
- Browser visual/offline testing was attempted, but this environment lacked Chromium and its download failed. These checks were not claimed as passed.
