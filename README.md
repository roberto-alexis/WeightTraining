# Three · Weight Training

An installable, offline-capable single-page training journal. Three full-body sessions per week, approximately 70–85 minutes each, with core in every session. No runtime dependencies, account, analytics or server required.

## Use on Android

1. Enable **Settings → Pages → Build and deployment → Source → GitHub Actions** in this repository.
2. Run **Actions → Test and deploy training app → Run workflow** if the initial push ran before Pages was enabled.
3. Open https://roberto-alexis.github.io/WeightTraining/ in Chrome on Android.
4. Tap **Install app**, or Chrome's menu → **Add to home screen → Install**.
5. Reopen once online to confirm “Offline cache ready”, then it can run offline.

## Program

Train A/B/C on nonconsecutive days (e.g. Monday/Wednesday/Friday). All sets below are work sets. Warm up for 8–10 minutes plus progressive ramp sets as needed. Leave about 2 repetitions in reserve (RIR). Session estimates include warm-up, core, rest and equipment transitions; gym congestion may add time.

| Day | Exercise | Sets × reps | Rest |
| --- | --- | --- | --- |
| A | Hack squat | 3 × 6–10 | 150s |
| A | Dumbbell bench press | 3 × 6–10 | 150s |
| A | Chest-supported row | 3 × 8–12 | 120s |
| A | Seated leg curl | 3 × 10–15 | 90s |
| A | Cable lateral raise | 2 × 12–20 per side | 75s |
| A | Rope triceps pressdown | 2 × 10–15 | 75s |
| A | Pallof press | 2 × 10–15 per side | 60s |
| B | Dumbbell Romanian deadlift | 3 × 6–10 | 150s |
| B | Neutral-grip lat pulldown | 3 × 8–12 | 120s |
| B | Incline dumbbell press | 3 × 8–12 | 120s |
| B | Supported split squat | 3 × 8–12 per leg | 120s after both legs |
| B | Reverse pec deck | 2 × 12–20 | 75s |
| B | Cable curl | 2 × 10–15 | 75s |
| B | Dead bug | 2 × 8–12 per side | 60s |
| C | Leg press | 3 × 8–12 | 150s |
| C | Machine chest press | 3 × 8–12 | 120s |
| C | Seated cable row | 3 × 8–12 | 120s |
| C | Machine hip thrust | 3 × 8–12 | 120s |
| C | Machine shoulder press | 2 × 8–12 | 120s |
| C | Standing calf raise | 2 × 10–15 | 75s |
| C | Cable crunch | 2 × 10–15 | 60s |

Only lateral raise/pressdown, reverse pec deck/curl and calf raise/crunch are suggested pairs. Rest 60–75s after each exercise when paired. In unilateral exercises, perform both sides before logging one set. Keep core if short on time; omit remaining accessories and save a partial session.

## Sustainable overload

Keep the weight stable and build repetitions within the range. Once **all prescribed sets** hit the upper end with **at least 2 RIR in two logged exposures at the same load**, increase by the smallest suitable increment, generally 2–5%, and restart at the low end. The app defaults to +2.5 lb/1 kg for upper body and accessories, +5 lb/2.5 kg for main leg work; adjust to available equipment and proportionate increments. Recommendations are placeholders, never silently logged weights. Every actual set needs explicit input and confirmation.

Recovery mode uses roughly half the sets, 10–15% less weight and 4 RIR; these sessions do not count toward progression. Review recovery every 4–6 weeks or when fatigue rises. Two below-range sessions at the same weight suggest a 7.5% reset. A dead bug progresses through reps, pauses and lever length rather than added weight. Changing variations resets the suggestion track.

Use one dumbbell's weight for presses/raises/curls, total loaded barbell weight for barbell exercises, and total external weight for split squats. Machine labels are equipment-specific. Keep technique, equipment and load conventions consistent. Pain-free alternatives are included. Stop for sharp pain, tingling or radiating symptoms; this is a general program, not rehabilitation.

The design follows [ACSM 2026 guidance](https://acsm.org/resistance-training-guidelines-update-2026/) on consistency and regular major-muscle-group training, with small increases informed by [ACSM progression guidance](https://pubmed.ncbi.nlm.nih.gov/19204579/). The exact program and two-exposure rule are conservative implementation choices, not an official ACSM plan.

## Data & development

- Drafts and session history use localStorage on this device and origin. No cloud sync. Export/import JSON backups from Journal. Imports validate and merge saved sessions; they do not restore or replace drafts.
- Clearing browser data, uninstall behavior or changing origins can remove access to logs. Back up regularly.
- The rest timer uses wall-clock time but does not guarantee a notification while Android suspends the app.
- Offline use requires an initial online visit. The service worker uses network-first fetch with cached fallback. Increment its cache name after app releases; close/reopen all app windows to activate a waiting update.
- Serve locally: `python3 -m http.server 8080` from this directory; open `http://localhost:8080`. Opening an HTML file directly will not support module/PWA behavior.
- Checks: `npm run check && npm test`. No npm installation is required.
