# Validation

JavaScript syntax checks and 13 Node tests pass. Coverage includes configuration edits/additions/order, invalid-plan rejection, planned weekly volume, RIR-specific progression, overload/partial-session protection, unit conversion, recovery exclusions, warm-up saving/validation, warm-up-only sessions, old backups and history compatibility after changing exercises.

Browser visual/interaction and Android install checks remain unverified in this environment because the Chromium download was blocked. On-device checks: add/check a warm-up, log work sets, save, view the journal, change lb/kg, export/import, and reopen offline after an online visit.

Source and deployment use GitHub Actions. The initial app deployed successfully after Pages was enabled; subsequent commits run the same checks and deployment workflow. Warm-ups are stored separately and do not earn work-set progression credit.
