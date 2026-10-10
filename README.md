# Three · Hypertrophy Training

Installable, offline-capable training journal: three full-body sessions, 75–90 minutes, core every day, and separately logged warm-up sets.

## Android installation

Open https://roberto-alexis.github.io/WeightTraining/ in Chrome → Install app (or menu → Add to home screen → Install). Reopen online once to cache the app. Export journal backups regularly; logs are device-local.

## Configure the plan

**Edit `program.json`**, then commit to `main`. GitHub Actions checks and deploys changes automatically. No app-code changes are needed to add exercises, change set counts, reorder exercises/sessions, or adjust rep ranges/rest.

- `sessions`: three session objects, rendered in array order. Each has `id`, `name`, `time`, and `exercises`.
- Exercise `id`: unique across the entire plan. Keep IDs stable to retain progression history; change the ID when changing the movement fundamentally.
- `name`, `cue`, `alt`: primary movement, technique note, and alternative names.
- `sets`, `min`, `max`, `rest`: work-set count, rep range, rest in seconds. Warm-ups are independent.
- `kind`: `load` or `body`; bodyweight work does not require a load.
- `targetRir`: minimum RIR required for progression. Default compounds 2; isolation 1, with 1–2 RIR encouraged.
- `increment`: unit-specific proposed increments, e.g. `{ "lb": 2.5, "kg": 1 }`. Use proportionate equipment increments, usually 2–5%.
- `group`: display label. Matching `PAIR` labels designate accessory pairings; these do not automate rest or exercise switching.
- `muscles`: primary muscle tags for the live weekly-volume summary. Multi-joint counts are approximate exposures, not equivalent isolation sets. Arms also receive indirect compound work.
- `time`: a human-readable estimate; adding sets/exercises can exceed the 90-minute budget. Reassess it when changing the plan.

`validatePlan()` checks required fields, ranges, and unique IDs. Limits: three sessions, up to 30 exercises/session and 30 sets/exercise. Limits prevent malformed data; they are not training recommendations.

Old saved history remains readable after removing a movement or changing sets. Existing drafts retain entered sets; additional work rows are appended as needed. Finish or export a current session before editing the plan. Imports validate and merge completed sessions; drafts are kept locally rather than restored from a backup import.

## Hypertrophy prescription

The starting weekly volume is chest 10, back 10, quads 10, hamstrings 8, side delts 5, biceps 5, triceps 5, calves 4 and core 6 primary-muscle sets. Glutes receive squat/RDL/split-squat/leg-press exposure; front/rear delts and arms receive compound work too. These counts do not mean every muscle has an identical optimal dose. Start here, assess recovery and progression over 4–6 weeks, then add 1–2 weekly sets to a lagging muscle only if recovery and time allow.

Use comfortable full range and controlled lowering. Keep approximately 2 RIR on compounds, 1–2 on isolation exercises. Progress reps first; once all prescribed sets hit the maximum at the target RIR twice at the same load, add the smallest suitable increment. Failure is not required. Review recovery every 4–6 weeks; use recovery mode for roughly half the work sets, 10–15% lighter and 4 RIR. Warm-ups and recovery sessions never earn progression credit.

Pair only marked accessories, resting 60–75 seconds after each exercise. Allow longer rest on compounds. If the gym is crowded or time is short, keep core and save a partial session rather than rushing.

### Day A · Squat + horizontal push · 75–90 min

| Exercise | Work sets × reps | Rest | RIR |
| --- | --- | --- | --- |
| Hack squat | 4 × 6–10 | 150s | 2 |
| Dumbbell bench press | 3 × 6–10 | 150s | 2 |
| Chest-supported row | 3 × 8–12 | 120s | 2 |
| Seated leg curl | 3 × 10–15 | 90s | 1 |
| Cable lateral raise | 3 × 12–20 | 75s | 1 |
| Rope triceps pressdown | 3 × 10–15 | 75s | 1 |
| Standing calf raise | 2 × 10–15 | 75s | 1 |
| Pallof press | 2 × 10–15 | 60s | 2 |

### Day B · Hinge + vertical pull · 75–85 min

| Exercise | Work sets × reps | Rest | RIR |
| --- | --- | --- | --- |
| Dumbbell Romanian deadlift | 3 × 6–10 | 150s | 2 |
| Neutral-grip lat pulldown | 4 × 8–12 | 120s | 2 |
| Incline dumbbell press | 3 × 8–12 | 120s | 2 |
| Supported split squat | 3 × 8–12 | 120s | 2 |
| Reverse pec deck | 2 × 12–20 | 75s | 1 |
| Cable curl | 3 × 10–15 | 75s | 1 |
| Dead bug | 2 × 8–12 | 60s | 2 |

### Day C · Leg press + balanced upper body · 80–90 min

| Exercise | Work sets × reps | Rest | RIR |
| --- | --- | --- | --- |
| Leg press | 3 × 8–12 | 150s | 2 |
| Machine chest press | 4 × 8–12 | 120s | 2 |
| Seated cable row | 3 × 8–12 | 120s | 2 |
| Seated leg curl | 2 × 10–15 | 90s | 1 |
| Machine shoulder press | 2 × 8–12 | 120s | 2 |
| Cable lateral raise | 2 × 12–20 | 75s | 1 |
| Standing calf raise | 2 × 10–15 | 75s | 1 |
| Cable curl | 2 × 10–15 | 75s | 1 |
| Rope triceps pressdown | 2 × 10–15 | 75s | 1 |
| Cable crunch | 2 × 10–15 | 60s | 1 |

## Evidence and limits

[ACSM 2026 guidance](https://acsm.org/resistance-training-guidelines-update-2026/) recommends roughly 10 weekly sets/muscle for hypertrophy and regular major-muscle training. [A 2024 trained-participant study](https://pubmed.ncbi.nlm.nih.gov/38393985/) found similar quadriceps growth at 1–2 RIR versus failure over eight weeks; it is not proof that every muscle or trainee responds identically. This plan is a practical starting point, not a guarantee of maximum growth. Recovery, nutrition, technique and individual response matter.

## Warm-up logging and data

Use Add warm-up set on any exercise, enter load/reps and check completion. Warm-ups appear separately in the journal and backup, excluded from work-set targets and overload suggestions. Up to 10 warm-up rows/exercise can be logged; the limit is not a prescription.

For dumbbells, use one dumbbell's weight for presses, raises and curls; total held weight for split squats; total barbell load for barbell variations. Reps for unilateral movements are per side; log one set after both sides.

No server or cloud sync. localStorage stores drafts/history at the current origin. Clearing browser data may erase logs: export backups first. Do not clear storage to update the app. Close all app/browser windows and reopen online if an update is waiting.

## Development

No runtime dependencies. Run `npm run check && npm test`. Serve with `python3 -m http.server 8080` from this directory. `program.js` loads JSON through fetch in browsers and filesystem reads in Node. Include `program.json` in deployment and offline cache. Increase the service-worker cache name when releasing updates.

## Shared illustrations and mobile cards

`images.json` is independent of `program.json`. It maps muscle names to reusable image URLs, accessible descriptions, and CSS atlas position/size. The app chooses the first primary muscle tag from each exercise and falls back to Full body. To use a standalone image, set `size` to `[100,100]` and `position` to `[50,50]`. Local URLs start with `./`; external images must use HTTPS. Remote images need their own offline caching policy.

The original adult cartoon gym portraits were generated with the built-in image-generation tool. Brief: a cohesive 3-column/4-row sheet of diverse handsome adult muscular men in opaque gym shorts, with poses emphasizing chest, back, quads, hamstrings, glutes, shoulders, biceps, triceps, calves, core, rear delts and full body. Pastel pink/lavender/aqua backgrounds, cel shading and no text. They are decorative muscle portraits, not anatomy or exercise-form diagrams. `assets/muscle-atlas.webp` is compressed for phones and shared by all cards.

Cards are collapsible native details controls: tap the exercise heading to open or close; the first exercise opens initially. Open/closed state stays stable while logging within the current app session. The light theme uses pink/violet/aqua accents and a thin rainbow header.

## Pride & Progress rewards

- Finish all planned work sets for a primary muscle group to earn at most one coin for that group per session, if a checked set beats a historical personal record for the same exercise ID and variation.
- Rep PR: more reps at the same load (0.05 kg tolerance). Bodyweight exercises use reps only. Estimated 1RM: Epley `load * (1 + reps / 30)` on 1–12 reps, improving by more than 1%. Estimates are not actual max tests.
- The new set must meet target RIR and leave at least as much reserve as the historical record. Warm-ups and deload sessions do not earn coins. No previous comparison means a baseline, not a badge. Keep equipment and technique consistent.
- Badge totals are derived from the current draft and recalculated at save. Editing/unchecking a set can remove eligibility. Shown muscle names persist in the draft to prevent replay from toggling checkboxes or refreshing. Saved badges live in the session's optional `rewards` object and are included in existing backup exports/imports. Deleting a session deletes its badges; imported duplicate IDs are ignored. Old sessions remain record baselines, without retroactive coins.
- Complete saved sessions get a day celebration; partial sessions retain earned coins but do not complete a day. The first time all configured days are completed in the same local Monday–Sunday week, a weekly celebration follows the daily one. Recovery sessions count toward completion. Week keys are captured in the device timezone when saved, so later travel does not regroup old rewards.
- Muscle splashes dismiss after 8 seconds or immediately with the close/continue button. Recaps stay until dismissed, support Escape, and use native modal focus behavior. Reduced-motion preferences disable animations. No badge is needed for an encouraging day/week recap.
- `images.json.celebrations` is a reusable artwork catalog independent of `program.json`. `reward-ui.js` cycles through four portraits in each of the `upper`, `lower`, and `champion` categories (12 total). Add or replace entries in the catalog to change the artwork. The last selection in each category is kept locally, so reopening does not always show the same guy. Assets are cached offline and optimized to 600×900 WebP. Coins are lightweight inline SVG body symbols with highlighted muscle regions.

### Celebration artwork provenance

Generated with the built-in image-generation tool. Saved assets: `assets/celebration-upper.webp`, `assets/celebration-lower.webp`, and `assets/celebration-champion.webp`.

Shared final prompt: “Use case: stylized-concept. Asset type: portrait celebration artwork for a gay Pride themed fitness phone app. [Subject below] Polished colorful cartoon editorial illustration, attractive masculine adult features and believable anatomy, tasteful fitness pin-up energy. Frame head through knees, entire head and flexing arm visible, subject centered. Pastel pink lilac aqua background with minimal rainbow arc, a few golden sparkles. Crisp painterly shading, joyful and uplifting. No text, no logos, no nudity, no sexual act, no transparent clothing. Single person, portrait aspect ratio.”

Subjects:
- upper: Handsome adult Latino man age 30 with short wavy dark hair, smiling, front double-biceps flex showing chest, arms and abs, wearing only opaque short turquoise athletic running shorts.
- lower: Handsome adult Black man age 32 with a close cropped beard, smiling over his shoulder in a three-quarter rear bodybuilding pose, showing strong back, glutes and thighs, wearing opaque short violet athletic running shorts.
- champion: Handsome adult East Asian man age 30 with black hair, confident warm smile, standing relaxed with one arm flexed in a victory pose, athletic muscular chest and abs, wearing only opaque short coral athletic running shorts.


### Browse all 12 celebration guys

Open **Journal → Preview celebration → Next guy** to cycle through the entire collection without logging sets or adding coins. The preview stays open until dismissed. Achievement splashes still dismiss after eight seconds. The twelve optimized WebP portraits total about 513 KiB and are cached for offline use. The original three portraits are preserved. Nine additional saved asset paths and their exact built-in generation prompts are in [CELEBRATION-ART.md](CELEBRATION-ART.md).
