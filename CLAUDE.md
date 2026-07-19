# Workout OS — Claude Code Rules

## Repo
`javiermontelongo-md/workout-OS` — public GitHub
Single `index.html` + `data.json`. No backend, no build step, no frameworks.

## Stack
Vanilla HTML/CSS/JS · Chart.js · Anthropic API · GitHub API

## Canonical State Rule
The ONLY canonical file is `index.html` on the `main` branch 
of the GitHub remote. Local changes that are not pushed do not 
exist from the user's perspective. Never report a feature as 
"done" without confirming it is pushed to origin/main.

## Push Rule — MANDATORY
After EVERY commit, immediately run:
  git pull --rebase && git push

Confirm push succeeded before reporting any change as complete.
After pushing, always state:
  - The commit hash
  - Output of: git log --oneline origin/main -3
  - Output of: git status (must show "nothing to commit, working tree clean")

Never leave commits unpushed. Never use git push --force 
unless the user explicitly instructs it after reviewing 
what will be overwritten.

## Before Starting Any Session
Run these before touching any file:
  git pull --rebase
  git status
  git log --oneline -5

This ensures you are working from the current canonical state.

## Coding Rules
- Only ever edit `index.html`
- Never touch `data.json` directly
- Never touch `.github/` directory
- No `!important` anywhere in CSS
- No dead code — audit before deleting any function
- `.app .panel` CSS specificity pattern
- `showTab(name)` is the single nav function

## Zero Dead Code Policy
Before deleting any function, confirm it has zero call sites.
Before adding any function, confirm it is called from at least one place.

## Verification After Every Change
After every edit, run grep checks to confirm:
- New functions exist at expected hit counts
- Deleted code has 0 hits
- No orphaned references remain

## Canonical Verification Rule
Never use local file grep to verify features.
Always verify against the remote canonical file directly.

  git show origin/main:index.html | grep -c "search-term"

Never run: grep -c "string" index.html
Always run: git show origin/main:index.html | grep -c "string"

## Commit Messages
Use conventional commit format:
  feat: description
  fix: description
  chore: description
  refactor: description

## Current Tabs
TODAY · FUEL · PROGRAM · LOG SESSION · ACTIVITY · PROGRESS · SETTINGS
(MILESTONES and RULES removed from nav. Rules content lives as collapsible drawer in SETTINGS.)

## Tab Roles
- **TODAY**: check-in sliders (energy/soreness/motivation/stress/sleep/weight) + recovery snapshot charts + system activity log
- **FUEL**: calendar-first layout — month grid at top, click any past/present day to load it for editing; edit card shows meal rows (time picker + food field), how-you-felt signals, macro summary, Save + AI buttons; weekly trend chart (14-day stacked bar macros + calorie line); AI flow diagram (desktop only). `_fuelEditDate` tracks selected date, defaults to today on tab open.
- **PROGRAM**: workout-type dropdown (AUTO/Push/Pull/Legs/Run/Cycling/Rest) + duration (30/60/90 min) + "Get Prescription" (instant engine render + async Haiku garnish) + prescription card with per-lift last-time + why-trace + accessory chips + engine trace + AI flow diagram (desktop only)
- **LOG SESSION**: lift set blocks + run log card; planned values pre-filled from `D.dailyPrescriptions[today]`; weight input placeholders match prescription (via DEF[] mutation + renderSets re-render in updateLogTabPlanned)
- **ACTIVITY**: monthly calendar (May 2026 floor, current month ceiling, ← → arrows) with indigo lift dots + jade run dots, clickable to open session drawer; paginated session history list (10/page, newest-first); volume records; 7-day AI suggestions from last prescription's weekPlan
- **PROGRESS**: e1RM prediction chart (decay curve + staleness badge) + progression staircase (working weight steps + reps dots, renderStaircaseChart) + accessory progress list (renderAccessoryTrends) + run metrics + VO2max trend + race predictions + body metrics chart
- **SETTINGS**: GitHub/API config, appearance, font sizing, Training Rules collapsible drawer (replaces old RULES tab)

## Key data.json fields
`sessions[]` · `runs[]` · `checkins[]` · `healthLogs[]` ·
`healthLastSync` · `stravaLastSync` ·
`runPrescriptions{}` · `dailyPrescriptions{}` ·
`rpeConfirmations[]` · `coachingLog[]` · `bodyMetrics[]` · `lastDeload`

## Lift Keys
`bench` · `ohp` · `pullup` · `row` · `squat` · `dl`

---

## CSS Design Tokens

### Color Palette (`:root`)
```
/* Design v2 (2026-07): deeper surfaces, luminous accents, real type hierarchy.
   One-time localStorage migration key: wos-design-v = '2' (clears old size overrides). */

/* Backgrounds */
--bg: #06070d        base page background (+ fixed radial gradient wash on body)
--s1: #0d101b        card surface (level 1)
--s2: #131727        inner surface (level 2)
--s3: #1a1f33        elevated surface (level 3)
--s4: #232941        top surface (level 4)

/* Borders */
--b:  rgba(124,131,247,0.14)   card outlines
--b2: rgba(124,131,247,0.27)   inner dividers
--b3: rgba(124,131,247,0.44)   emphasis borders

/* Accent */
--a:  #7c86f8   periwinkle (primary CTA, active nav)
--a2: #34c98e   jade       (positive / run)
--a3: #4aa3f0   blue       (info)
--a4: #ef6292   rose       (alert)
--a5: #b388f5   violet     (secondary accent)
--aw: #d9924f   amber      (warning / wildcard / deload)
--red: #f0648f

/* Text */
--t:  #eef1fc   primary body text
--t2: #aeb8d6   secondary labels, subtext
--t3: #7b87a8   tertiary hints, timestamps

/* Depth */
--shadow-1 / --shadow-2   card resting/hover shadows (+1px inset top highlight)
--ring                    focus ring for inputs (3px glow)
```

### Typography & Font System
The app uses a two-level font system:

**Base size** — controls body text. Set via font preset buttons (XS/S/M/L/XL) or saved
to localStorage as `wos-fontsize` (stores the PRESET KEY 14/17/19/22/26, not px —
since design v2, base px ≠ key; M key 19 → base 17px). Content tiers scale with the
preset; meta tiers (labels/badges/timestamps) scale less so hierarchy survives.

**Component sizes** — per-component sliders in Settings override individual elements.
Stored in localStorage as `wos-comp-fs` (desktop) and `wos-comp-fs-mobile`.
Components: logo, nav, heading, sublabel, badge, input, btn, cardtext, exercise,
dataval, caltext, mono, presctext (desktop); m_mlogo, m_nav, m_navlbl, m_heading,
m_label, m_input, m_btn, m_cardtext (mobile).

**CSS variables (`:root`)** — auto-managed by applyAppearance():
```
--fs-xs:           13px   (small labels, timestamps, mono tags)
--fs-sm:           15px   (secondary text, check-in labels)
--fs-presc-text:   15px   (prescription body text — separate slider)
--fs-presc-lift:   15px   (lift row text — separate slider)
Desktop M defaults: body 17 · h1 30 · nav 14 · lbl 12 · bdg 12 · sv 30 · btn 14
```

**Font presets** (applyFontPreset):
```
Keys 14/17/19/22/26 → base px 14/15/17/19/22 (M = key 19 = 17px base, default)
```

**Small text floor** — setSmallTextSize(px) independently controls --fs-xs and --fs-sm.
Range: 22–30px. Stored as `wos-small-text`.

**Font pairs**: DM Sans + DM Mono + Fraunces (default), or Inter + IBM Plex Mono + Playfair.

### Layout
```css
/* Desktop */
.main {
  flex: 1;
  padding: 24px 32px;
  width: 100%;
  max-width: 50%;      /* center column = 50% of viewport */
  margin: 0 auto;
}

/* Mobile override */
.main { padding: 0; max-width: 100%; flex: 1; overflow: hidden; position: relative; }
```

### Grid & Card Utilities
```css
.g2  { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.g3  { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; }
.card { background: var(--s1); border: 1px solid var(--b);
        border-radius: var(--rl); padding: 18px 20px; margin-bottom: 16px; }
--r:  12px   (standard border-radius)
--rl: 18px   (large border-radius, cards)
```

### Mobile Nav
- `--nav: 72px` on mobile (taller than desktop for easier tap targets)
- 7 tabs match desktop order: TODAY · FUEL · PROGRAM · LOG · ACTIVITY · PROGRESS · SETTINGS
- `.desktop-only { display: none; }` hides AI flow diagrams on mobile

### Calendar Dot Classes (ACTIVITY tab month grid)
```css
.cal-dot          { display:inline-block; width:8px; height:8px; border-radius:50%; margin:0 2px; }
.cal-dot.lift     { background:var(--a); }   /* indigo — strength sessions */
.cal-dot.run      { background:var(--a2); }  /* jade — runs (Strava or logged) */
.cal-dots         { text-align:center; margin-top:3px; }
.cal-cell.cal-empty { background:transparent; border-color:transparent; pointer-events:none; }
```

### Recovery Snapshot Charts (TODAY tab)
4 charts rendered by `renderSnapshotCharts()`, each 300px tall:
1. **Sleep · 7 days** — actual sleep (green line, left axis h), optimal band 7–7.5h, 30d avg
2. **Steps + Exercise + Calories · 7 days** — steps (cyan, left ySteps), exercise min (purple, right yExercise), active kcal (orange, right yCalories offset). yExercise and yCalories are SEPARATE axes — never share them or exercise minutes will be squished when cal data arrives.
3. **Walking HR + Speed · 7 days** — walking HR bpm (orange, left), walking speed mph (blue, right)
4. **Resting HR + Respiratory Rate · 7 days** — RHR bpm (red, left), resp rate br/min (purple, right)

Key rule: all health data mapping must use `??null` (nullish coalescing), never `||null` — `||null` treats 0 as missing data.

### DOM IDs (ACTIVITY panel)
| ID | Element | Purpose |
|----|---------|---------|
| `cal-prev-btn` | button | ← month nav; disabled at May 2026 floor |
| `cal-next-btn` | button | → month nav; disabled at current month |
| `session-list-card` | div.card | Container for session history list |
| `sess-list-rows` | div | Paginated session rows rendered by renderSessionList() |
| `sess-list-nav` | div | ← Older / Newer → pagination buttons |
| `sess-list-count` | span | "X of Y sessions" label |

---

## Function Index
All line numbers are from origin/main. Verify before editing:
  git show origin/main:index.html | grep -n "function functionName"

### Config & Data
| Line | Function | Purpose |
|------|----------|---------|
| ~2258 | lCFG() | Load config from localStorage |
| ~2262 | sCFG() | Save config to localStorage |
| ~2263 | defD() | Default data structure — all data.json fields |
| ~2269 | fetchData() | GET data.json from GitHub API |
| ~2293 | mergeRemoteD(remoteD) | Merge remote data.json with local defaults on load |
| ~2308 | gitPush(commitMsg) | 3-retry GitHub PUT helper — handles 409 SHA conflicts; called by push() and pushSilent() |
| ~2326 | push(btnId, msgId) | PUT data.json to GitHub API with UI feedback |
| ~4218 | pushSilent() | Silent PUT data.json — no UI feedback |

### Boot & Navigation
| Line | Function | Purpose |
|------|----------|---------|
| ~2362 | onLoad() | App boot — fetches data, migrates runPrescriptions→dailyPrescriptions, renders tabs |
| ~2378 | renderSystemLog() | System activity feed — merges runPrescriptions + dailyPrescriptions for display |
| ~2515 | renderRulesTab() | Populates both #rules-hard-list (panel) and #rules-hard-list-settings (Settings drawer) with live hard rule status + z-score thresholds |
| 2798 | toggleRulesDrawer() | Toggle the Training Rules collapsible drawer in Settings tab |
| ~2546 | showTab(n) | Single nav function — calls renderCalendar()+renderSessionList()+renderProgressSessions() for 'week'; renderRulesTab() for 'rules'; _syncAppearanceUI() for 'settings' |
| ~2557 | renderTab(n) | Renders content for a given tab (runs once per tab, cached in `rendered{}`) |
| ~2567 | sync(state, label) | Sync status indicator |
| ~2573 | msg(id, html) | Inline message renderer |

### Appearance & Theme
| Line | Function | Purpose |
|------|----------|---------|
| ~2052 | applyAppearance() | Apply all saved appearance settings on boot (theme, font pair, base size, component sizes, small text) |
| ~2076 | setTheme(name) | Apply and persist theme |
| ~2077 | setFontPair(name) | Apply and persist font pair |
| ~2078 | setFontSize(px) | Apply and persist base font size |
| ~2129 | applyAppearanceChanges() | Save all appearance changes from Settings form |

### Settings & Config UI
| Line | Function | Purpose |
|------|----------|---------|
| ~3113 | saveCFG() | Save GitHub token + repo settings |
| ~3120 | testCon() | Test GitHub connection |
| ~3126 | saveAPI() | Save Anthropic API key |
| ~3127 | clearAPI() | Clear API key |
| ~3128 | debugAPI() | Debug API key state |
| ~3139 | runMig() | Run data migrations |
| ~3154 | exportData() | Export data.json |
| ~3155 | clrCFG() | Clear all local config |

### AI Layer
| Line | Function | Purpose |
|------|----------|---------|
| ~3160 | liftTrend(key, sessions, weeks=4) | Computes 'improving'/'plateauing'/'declining'/'insufficient_data' for a lift key over N weeks |
| ~4226 | generateDailyPrescription(workoutType, durationMins) | Engine-first: renders buildEnginePrescription() output instantly, then optional _fetchPrescriptionGarnish() Haiku call (claude-haiku-4-5, 400 tokens) merges coach notes. 'auto' workoutType supported. Persists D.lastDeload when a deload prescription generates. |
| 6604 | getLatestPrescription() | Returns the most recent dailyPrescription entry (any date) |
| 6612 | renderLogFeedback() | Renders post-session feedback UI in LOG tab |
| 6638 | generateSessionFeedback(ts) | AI-powered post-session feedback generation (async) |

### Hard Rule Engine
| Line | Function | Purpose |
|------|----------|---------|
| ~4038 | compute7DayMeans() | Rolling 7-day HRV/RHR averages + 60-day personal z-score baseline. Returns: hrv, rhr, count, hrvBaseline60, hrvSD60, hrv60Count, rhrBaseline60, rhrSD60, rhr60Count. Falls back to ATHLETE.hrvBaseline/rhrBaseline if <30 days of data. |
| ~4083 | evaluateTrainingStatus() | Deterministic rule engine. Uses 60-day z-score baseline (not fixed % thresholds) for HRV/RHR. DELOAD_WEEK flag now comes from detectDeload() (engine), not a calendar block week. Called in generateDailyPrescription() and renderRulesTab(). Returns: canTrain, canDoQuality, canDoHeavyLifts, liftRPECap, volumeModifier, stressScore, activeFlags, reasons, mafHR, latestHRV, latestRHR, sleepHours, means. |

### System Health
| Line | Function | Purpose |
|------|----------|---------|
| 4532 | renderSystemHealth() | Renders system health status card (Strava sync time, health sync, API status) |

### Session Logging
| Line | Function | Purpose |
|------|----------|---------|
| ~2598 | initSets() | Initialize set tracking state |
| ~2599 | addSet(lift) | Add a set to a lift block |
| ~2604 | removeSet(lift, i) | Remove a set from a lift block |
| ~2605 | renderSets(lift) | Render set inputs for a lift |
| ~2613 | saveSession() | Save session to D.sessions[]. Writes both `day` and `type` fields. |
| ~2663 | resetLogForm() | Reset log form to defaults |
| ~2672 | renderSessHist() | Render session history list (LOG tab legacy view) |
| ~3942 | onDayTypeChange(value) | Shows correct lift blocks per day type. Normalizes push/pull/legs→A/B/C internally; handles A/B/C and run/* types. Calls renderRunLogCard() for run types. |
| ~3985 | startLoggingSession() | Navigate to LOG tab and set day type from presc-workout-type dropdown |
| ~3993 | renderRunLogCard(targetDate) | Renders run prescription summary in LOG tab run card. Reads dailyPrescriptions first, falls back to runPrescriptions. Shows Mark Run Complete button → ✓ Run logged message. |
| ~4029 | markRunComplete(targetDate) | Mark run complete in dailyPrescriptions. Calls renderRunLogCard(). |
| ~4412 | renderPrescriptionCard(prescription) | Renders full prescription in #prog-today-card. Handles push/pull/legs (lift table + accessories) and run/cycling (mainSet/pace/HR). Shows reasoning, warmup, cooldown, coachNote, ifTooHard, watchOutFor. |
| ~4457 | renderCustomExercises() | Render user-added custom exercises on the prescription card; shows add-form + list |
| ~4469 | addCustomExercise() | Add a custom exercise to D.dailyPrescriptions[today].customExercises and pushSilent |
| ~4485 | removeCustomExercise(i) | Remove custom exercise by index, pushSilent, re-render |
| ~4493 | renderWeekSuggestions(weekPlan) | Renders 7-day confidence grid in #week-suggestions. Shows date/dow + suggestion + confidence badge (HIGH/MED/LOW) + reason. |
| ~4510 | confirmRPE(lift, actualRPE) | RPE confirmation after session — writes to D.rpeConfirmations[], pushSilent |
| ~4590 | updateLogTabPlanned() | Pre-fill planned values in LOG tab from D.dailyPrescriptions[today]. Mutates DEF[] and re-renders sets so weight placeholders always match prescription. |
| ~4683 | showRPEConfirm(lift) | RPE confirmation UI |

### Check-in
| Line | Function | Purpose |
|------|----------|---------|
| ~4696 | calcFatigue(energy,sleep,soreness,motivation,stress) | Computes fatigueScore 0-10 |
| ~4701 | updateFatiguePreview() | Live fatigue preview in check-in UI |
| ~4713 | togglePostCall() | POST_CALL flag toggle — blocks all quality/heavy |
| ~4723 | saveCheckin() | Save check-in to D.checkins[], then renderSnapshotCharts() |
| ~4768 | renderSnapshotCharts() | Render 4 health snapshot charts (sleep / steps+exercise+cal / walking HR+speed / RHR+resp) |
| 7452 | setSnapRange(days) | Set the day range for snapshot charts (7/14/30 days) |
| ~5071 | initCheckinTab() | Initialize check-in tab — populate existing today values |

### Fuel Log (FUEL tab)
| Line | Function | Purpose |
|------|----------|---------|
| ~2683 | initFuelLog() | Tab init — resets `_fuelEditDate` to today, calls fuelSelectDate + renderFuelTrendChart |
| ~2690 | fuelSelectDate(dateStr) | Load a date's data into the edit form; updates `_fuelEditDate`, meal rows, signals, macros, re-renders calendar with selected highlight |
| ~2710 | fuelGoToday() | Navigate edit form to today |
| ~2713 | fuelGoYesterday() | Navigate edit form to yesterday |
| ~2716 | renderFuelRows() | Render meal input rows with time-picker buttons |
| ~2720 | addFuelMealRow() | Append empty row to `_fuelRows` |
| ~2721 | removeFuelMealRow(i) | Remove a row from `_fuelRows` |
| ~2723 | saveFuelDay() | Save `_fuelEditDate` day to D.fuelLog[], calls estimateMacros, push, renderFuelCalendar, renderFuelTrendChart |
| ~2761 | renderFuelMacros(entry) | Render macro pills + bar + meal breakdown inside #fuel-macros-card |
| ~2780 | fuelDayAdvice() | AI check-in using `_fuelEditDate`; works for past days too |
| ~2870 | updateFuelMemory() | Compress last-7-day patterns into D.fuelMemory.summary (silent, background) |
| ~2880 | renderFuelFlowDiagram() | Render animated AI flow diagram for fuel tab (desktop only) |
| ~2730 | estimateMacros(meals) | AI macro estimation per meal via Anthropic API |
| ~3120 | renderFuelCalendar() | Month grid with amber dots for logged days; all past/present dates clickable → fuelSelectDate; selected date gets fuel-cal-selected class |
| ~3154 | fuelCalNav(dir) | Month navigation (floor -12 months) |
| new | openTimePicker(idx) | Open time picker modal for a meal row; parses existing time string |
| new | _renderTimePicker() | Re-render hour/min/ampm selections inside modal |
| new | fuelTpSetAmPm(ap) | Toggle AM/PM in time picker state |
| new | closeTimePicker() | Hide time picker modal |
| new | confirmTimePicker() | Write selected time to `_fuelRows[idx]`, re-render rows |
| new | renderFuelTrendChart() | 14-day stacked bar (protein/carbs/fat in grams) + calorie line using Chart.js; stores instance in `_fuelTrendChart` |

### Calendar & Activity View (ACTIVITY tab)
| Line | Function | Purpose |
|------|----------|---------|
| ~2689 | computeVolumeBests() | Compute best working-weight volume for bench/ohp/squat/dl from session history — returns "weight×sets×reps" strings |
| ~2710 | updProgressStats() | Update progress tab e1RM stat cards |
| ~2768 | getSessionsForDate(dateStr) | Filter D.sessions[] for a given date string |
| ~2772 | calNav(dir) | Month calendar navigation — clamps to May 2026 floor and current month ceiling |
| ~2779 | renderCalendar() | Full month grid render — blank leading cells, lift/run dots per day, disables nav at limits |
| ~2832 | handleDayCardClick(dateStr) | Day card click — past lift→drawer, past Strava-only run→fake-session drawer, future→program tab |
| ~2858 | openSessionDrawer(session, dateStr) | Slide-in session detail drawer |
| ~2879 | closeSessionDrawer() | Dismiss session drawer |
| ~2888 | buildSessionDrawerContent(session, dateStr) | Full session detail HTML; includes Edit button for real logged sessions |
| ~2960 | openSessionDrawerByTs(ts) | Look up session in D.sessions[] by ts, open drawer |
| ~2964 | renderSessionList() | Render paginated session history (10/page, newest-first) into #sess-list-rows + #sess-list-nav |
| ~2996 | renderProgressSessions() | Render recent sessions list in PROGRESS tab |
| ~3026 | editSession(ts) | Find session by ts, replace drawer content with buildEditForm output |
| ~3033 | buildEditForm(session) | Full edit form HTML — session-type select, lift blocks, cardio fields, notes, Save/Cancel |
| ~3058 | removeEditSet(key, i, ts) | Remove a set row from in-drawer edit form, re-render remaining sets |
| ~3069 | saveEditedSession(ts) | Collect form values, update D.sessions[idx], call recalcE1RMs(), gitPush, refresh views, reopen drawer |
| ~3102 | recalcE1RMs() | Reset D.currentLifts to hardcoded defaults then replay all sessions to recompute e1RMs from scratch |

### Prescription, Program & AI Flow
| Line | Function | Purpose |
|------|----------|---------|
| ~3238 | buildPredictions(currentE1RM, slope) | 4-week e1RM projections (optimistic/conservative dashed lines) |
| ~3249 | predictLift(liftKey) | Chart data for a lift — sets/reps/weight now come from prescribeLift() so charts match prescriptions; keeps regression slope + optimistic/conservative projections. Called by renderPredictionChart, showRPEConfirm, confirmRPE |
| ~4526 | renderPredictionChart(lift) | e1RM prediction chart — includes decay curve overlay and staleness badge from getDecayedE1RM/buildStrengthDecayCurve |
| ~4577 | setChartLift(lift) | Set active lift for prediction chart |
| ~4582 | toggleEquationDrawer() | Toggle the e1RM equation reference drawer in PROGRESS tab |
| ~5185 | renderAIFlowDiagram() | Render the animated AI flow diagram in PROGRAM tab (desktop only) |
| ~5572 | afdShowDetail(nodeId) | Show detail panel for a flow diagram node |
| ~5609 | afdCloseDetail() | Close the flow diagram detail panel |

### Fitness Decay Model
| Line | Function | Purpose |
|------|----------|---------|
| 4607 | fitnessDecayFactor(lastDateStr, type) | Exponential decay: `exp(-k * max(0, days - grace))` clamped to floor. Cardio: k=0.007, grace=14d, floor=0.65. Strength: k=0.003, grace=21d, floor=0.60. Returns 1.0 within grace period. |
| 4614 | getDecayedVO2max() | Pool runs + rides → find most recent activity date → apply cardio decay to best VO2max estimate. Bike rides cross-pollinate (VO2max from rides counts for run predictions). |
| 4639 | getDecayedE1RM(liftKey) | Apply strength decay to a lift's current e1RM. Returns `{decayed, peak, factor, daysInactive, lastDate}`. |
| 4652 | buildStrengthDecayCurve(lastDate, peakE1RM) | Build weekly decay data points for chart overlay (weeks 0–52). Used by renderPredictionChart for dashed decay line. |

### Run Metrics
| Line | Function | Purpose |
|------|----------|---------|
| ~3184 | calcE1RM(weight, reps) | Epley e1RM formula, rounded to 2.5lb |
| ~3186 | getLiftHistory(liftKey, daysBack=60) | Filter sessions, compute e1RM with recency weights |
| ~3277 | localDS(d) | Date → YYYY-MM-DD string in local timezone |
| ~3278 | getRestingHR() | Latest RHR from healthLogs |
| ~3284 | estimateVO2max(run) | VO2max from single run w/ HR + distance≥2mi. hrMax fallback computed from max observed across D.runs (not hardcoded). Returns null if insufficient data. |
| ~3322 | vdotPredict(vo2max) | VDOT pace predictions |
| ~3346 | riegelPredict(runs) | Riegel race prediction |
| ~3371 | hrRegressionPredict(runs) | HR regression pace prediction |
| ~3404 | calcRacePredictions() | Full race prediction — uses getDecayedVO2max() for decay-adjusted predictions |
| ~3506 | secsToRaceTime(s) | Format seconds as race time |
| ~3515 | secsToPace(totalSecs, miles) | Format seconds as pace |
| ~3523 | renderRacePredictions() | Render race prediction cards with staleness badge |
| ~3603 | setRacePredChart(dist) | Set active race pred chart distance |
| ~3612 | renderRacePredChart(dist) | Render race prediction chart |
| 5836 | setVO2Range(days) | Set day range for VO2max trend chart |
| ~3825 | renderRunMetricsSummary() | Render run metrics summary |
| ~3830 | renderRunChart() | Render combined pace/distance/HR chart for last 10 runs |
| ~3896 | renderVO2TrendChart() | Render VO2max trend chart (calculated estimate + Apple Watch dots) on PROGRESS tab |

### Body Metrics
| Line | Function | Purpose |
|------|----------|---------|
| ~5108 | parseSleepHHMM(str) | Parse HH:MM sleep string to hours |
| ~5116 | updateBodyCalcs() | Update BMI + body calc display |
| ~5130 | renderBodyChart(type) | Render body metrics chart |
| ~5174 | setBodyChart(type) | Set active body chart type |

---

## Prescription Architecture (rebuilt 2026-07-18)

### Deterministic engine — ALL numbers computed locally, zero AI
```
buildEnginePrescription(workoutType, durationMins)   ← core; instant, works offline
  ├── autoPickWorkoutType()      workoutType='auto' → days-since rotation with why-trace
  ├── detectDeload()             6+ lift sessions/21d + no deload in 28d → deload week
  │                              (D.lastDeload persisted by generateDailyPrescription;
  │                               active 7 days; also flags DELOAD_WEEK in
  │                               evaluateTrainingStatus → blocks quality runs)
  ├── prescribeLift(lift, ts, deload)   double progression per lift:
  │     · reads last 1-2 sessions of non-wildcard working sets
  │     · all sets at top of REP_RANGES at RPE ≤8 → +LOAD_INC, reps reset to bottom
  │     · 2 sessions below range bottom → reset to 90%
  │     · RPE ≥9.5 → hold and consolidate
  │     · deload override: 70% load, 2×5, RPE ≤6
  │     · returns {weight,sets,reps,targetRPE,why[],last{date,daysAgo,display}}
  ├── pickAccessories(dayType, count)   least-recently-done rotation from
  │                                     ACCESSORY_CATALOG with target diversity
  └── prescribeRun(kind, ts)     deterministic run/ride: 80/20 quality slot logic,
                                 MAF cap, weekly mileage from Strava history

Constants: REP_RANGES · LOAD_INC · START_WEIGHTS · BASE_SETS · LIFT_LABELS ·
DAY_LIFTS · ACCESSORY_CATALOG (8-9 per day type, each {id,name,target,sets,reps})
```

### AI garnish — the ONLY AI call in the prescription path
```
generateDailyPrescription(workoutType, durationMins)
  1. Renders engine prescription instantly (no API key needed)
  2. _engineNextSession(type) → deterministic next-session rec
  3. IF api key: _fetchPrescriptionGarnish() → claude-haiku-4-5-20251001,
     max_tokens 400, prompt = engine decisions + biometrics (~700 tokens in)
     Returns {reasoning, coachNote, liftNotes{lift:cue}, watchOutFor[]} — merged
     into the card. Failure = silent skip, prescription unaffected.
  ~$0.002/call vs ~$0.021 for the old Sonnet do-everything call.
```

### Prescription card (renderPrescriptionCard)
Per lift: sets×reps @ weight + RPE cap + "Last: 115×8@7,... · 2d ago" +
"↳ why" line. Accessory catalog chips (recommended pre-selected, tap to swap →
toggleAccessory(id)). Engine trace block at bottom. Haiku coachNote/watchOutFor
render when present. Rest days get a simple rest card.

### Wildcard quick-add (LOG SESSION)
wildcard-block card: dropdown of big-6 + full catalog → renderWildcardBlock().
Lift wildcard sets merge into session[lift].sets tagged wc:true; accessory
wildcards into session.accessories tagged wildcard:true.
wc:true sets are EXCLUDED from: getLiftHistory, prescribeLift/_workingSets,
saveSession updE, recalcE1RMs, renderStaircaseChart. This lets light rebuild
sets (e.g. 2×5 squat @ 95 after push day) be logged without corrupting
progression, stall detection, or e1RM.

### Accessory logging & progress
Prescribed accessories flow into LOG tab inputs (structured objects with id;
legacy freeform strings still parse). Saved to sessions[].accessories
{id?,name,prescribed,weight,sets,reps,notes}. renderAccessoryTrends() on
PROGRESS shows first→latest with weight deltas, keyed by id (fallback name).

## ATHLETE Constant Fields
```
age: 28
weightLbs: 225
heightInches: 70
waistInches: 37
mafModifier: −5
get mafHR() { return 180 − age + mafModifier; }   // currently 147

// Baselines (95 days Apple Watch Feb–May 2026) — fallback only when <30 days data
hrvBaseline: 53.5ms
rhrBaseline: 57.2bpm
sleepBaseline: 7.1h

// Hard rule thresholds (sleep + fever only — HRV/RHR use z-score now)
FEVER_TEMP:   1.5    (delta°C wrist temp → rest only)
SLEEP_BLOCK:  5.0h   (blocks quality + heavy)
SLEEP_WARNING: 6.5h  (reduces volume, caps RPE)

// Recovery windows (hours between workout types)
RECOVERY.quality_to_quality: 48
RECOVERY.long_to_quality: 72
RECOVERY.legs_to_quality_run: 24
RECOVERY.legs_to_long_run: 48
... (see ATHLETE.RECOVERY object for all pairings)

// MRV (resident-adjusted max recoverable volume, sets/week)
MRV: { squat:16, deadlift:10, bench:18, ohp:14, row:16, pullup:16 }

// Stall detection
STALL_THRESHOLD: 2   (stalls per lift before deload)
GLOBAL_STALL_COUNT: 3
DELOAD_FACTOR: 0.90
DELOAD_OVERREACH: 0.80

goals: {
  primary:   'sub-20 5K'
  secondary: 'increase VO2max'
  approach:  'polarized training — 80% easy zone 2, 20% quality work'
}
```

## D.dailyPrescriptions[date] Shape
```
workoutType:     'push'|'pull'|'legs'|'run'|'cycling'|'rest'
durationMins:    30|60|90
generatedAt:     ISO string
reasoning:       string — AI rationale
warmup:          string
mainWork:        { lifts:{bench,ohp,...} } for lift days
                 { mainSet, totalDistance, paceTarget, hrCeiling, effort } for run/cycling
accessories:     [{name, sets, reps, note}, ...]
cooldown:        string
coachNote:       string — left-border callout
ifTooHard:       string — amber banner
watchOutFor:     string[]
weekPlan:        [{date, dow, suggestion, confidence:'high'|'medium'|'low', reason}, ...]
completed:       bool (run workouts only)
completedAt:     ISO string
postRunFeedback: removed
customExercises: [{name, sets, reps, note}, ...] (user-added extras)
```

## D.coachingMemory Shape
```
compressed: null | {
  liftTrends, runFitnessPattern, recoveryPattern,
  injuryFlags, respondsBestTo, compressedThrough
}
notes: [{date, workoutType, observations, coachingPoints}, ...]
```

## D.healthLogs[] Entry Shape
Written by `.github/scripts/health-sync.js` via the `health-sync` GitHub Actions workflow.
Triggered by Health Auto Export (HAE) REST API webhook. One entry per day, upserted by date.

```
date:            'YYYY-MM-DD'
source:          'apple_health'
restingHR:       bpm (integer) — Apple Watch
hrv:             ms (float) — Apple Watch overnight SDNN
wristTemp:       delta°C from 98.6°F baseline — ALWAYS delta°C, never absolute°F
                 negative = below baseline (normal range: −2 to −0.5)
sleepHours:      hours, 1 decimal — time ASLEEP (not time in bed)
sleepDeep:       hours (float) — HAE only
sleepREM:        hours (float) — HAE only
sleepLight:      hours (float, Apple 'core' stage) — HAE only
sleepAwake:      hours (float) — from sleepEntry.awake, NOT inBed−totalSleep
steps:           integer — Apple Watch + iPhone combined (HAE deduplicates)
exerciseMinutes: integer — Apple Watch Exercise ring minutes
activeCalories:  integer — active energy burned (kcal); null in pre-Jun 2026 entries
walkingHR:       bpm (integer) — Apple Watch average walking HR
walkingSpeed:    mph (float) — Apple Watch average walking speed; null in pre-Jun 2026 entries
respiratoryRate: breaths/min (float) — Apple Watch overnight
vo2maxApple:     ml/kg/min (float) — Apple Watch estimate, updates ~weekly; null most days
```

### Health Sync Infrastructure
- Workflow: `.github/workflows/health-sync.yml` — triggered by HAE `repository_dispatch`
- Script:   `.github/scripts/health-sync.js` — parses HAE JSON, upserts healthLogs by date
- Concurrency: `group: health-sync, cancel-in-progress: false` prevents race condition
- Push safety: `git pull --rebase` before `git push` in the workflow commit step
- HAE metric names: `step_count`, `apple_exercise_time`, `active_energy`,
  `walking_heart_rate_average`, `walking_speed`, `resting_heart_rate`,
  `heart_rate_variability_sdnn`, `apple_sleeping_wrist_temperature`, `sleep_analysis`
- Steps and exercise time use `getSumQtyForDate()` (sums all entries for date — handles
  both summarized single-entry and per-minute "Today" payloads)

### Strava Sync Infrastructure
- Workflow: `.github/workflows/strava-sync.yml`
- Schedule: `0 * * * *` — **every hour** (changed from once-daily to catch runs shortly after completion)
- Cloudflare webhook approach abandoned — OAuth token kept invalidating. Hourly cron is the reliable alternative.

## D.runs[] Entry Shape
Written by the Strava sync (`.github/scripts/strava-sync.js`). Field names below are
the ACTUAL keys in data.json — earlier docs said `distanceMi`/`paceMinkm`, which is wrong.
```
date:         'YYYY-MM-DD'
stravaId:     number (Strava activity id)
name:         string (Strava activity title)
type:         'run' | 'ride'
runType:      'easy' | 'long' | 'intervals' | 'tempo' | 'moderate' | 'walk' | 'cycling'
              (NOTE: 'quality' filter must also include 'intervals' and 'tempo')
distance:     miles (float)            ← field is `distance`, NOT distanceMi
pace:         seconds per mile (int)   ← e.g. 688 = 11:28/mi (NOT min/km)
duration:     seconds
heartRateAvg: bpm
heartRateMax: bpm
elevationGain: feet
averageWatts / weightedAvgWatts: cycling only (watts)
source:       'strava'
```

## State Variables (global JS)
| Variable | Default | Purpose |
|----------|---------|---------|
| `calMonthOffset` | `0` | Months relative to current month for the ACTIVITY calendar (0 = now, -1 = last month). Floor: May 2026. |
| `sessionListPage` | `0` | Current page index for the session history list (0 = most recent 10). |
| `fuelMonthOffset` | `0` | Months relative to current month for the FUEL calendar. Floor: -12 months. |
| `_fuelRows` | `[{time:'',food:''}]` | Current edit state for meal input rows. |
| `_fuelEditDate` | `''` | Date string (YYYY-MM-DD) currently loaded in the Fuel edit form. Set by fuelSelectDate(). Defaults to today on tab open. |
| `_fuelTrendChart` | `null` | Chart.js instance for the 14-day macro trend chart. Destroyed and recreated by renderFuelTrendChart(). |
| `_fuelTP` | `{rowIdx,hour,min,ampm}` | Time picker transient state — which row is being edited and current selections. |

## What Has Been Removed
- var DP, DAYS, DT, DC objects (dead vars — deleted)
- var weekNavOffset (dead — week nav system removed)
- var calOffset (dead — replaced by calMonthOffset for month-based navigation)
- getWeekStart(offset) — removed when calendar switched from 7-day week view to full month grid
- .ap-confidence-badge CSS rules (dead — renderAdaptivePlan deleted)
- Hardcoded cardio struct in saveSession()
- Legacy pullups:{sets,reps} aggregate in saveSession()
- Old BIOMETRIC RULES hardcoded prose in buildPlanPrompt()
- **genToday() + fai() + modeChg()**: AI coaching narrative on TODAY tab removed
- runDayMap, old run prescription JSON shape (primaryRecommendation{...})
- **Entire schedule/plan system (27 functions)**: buildSchedule, applyScheduleOverride,
  confirmDayOverride, buildLocalPlan, buildPlanContext, buildPlanPrompt, parsePlanResponse,
  generateAdaptivePlan, renderAdaptivePlan, getDayProgram, renderDayCard, toggleProgDay,
  renderProgramTab, renderWeekNavLifts, renderWeekNav, weekNavNav, getWeekLabel,
  getWeekDateRange, getBlockPhaseForOffset, getActualLiftsForWeek, getPlannedLiftsForWeek,
  ldPrev, buildRunProfile, generateRunPrescription, renderRunPrescriptionCard,
  updateTodayPreview, getTodayDayType, buildPrescriptionString
- SESSION CHECKLIST card from Today tab (chk/restChk retained for Milestones)
- REDUCE IF: and REDUCTION ORDER: cards from Today tab (live in RULES tab)
- scheduleOverrides — D.scheduleOverrides field (never written after plan system removal)
- setTrainingMode() + D.trainingMode (AI never read it)
- spin(id) — spinner helper (all callers removed)
- getActivityBadges() / getPlannedBadge() — old calendar badge helpers
- getAccessoryVariation() — rotation helper for old plan system
- toggleRunLogSection() — managed by onDayTypeChange/renderRunLogCard now
- _buildSparkRows() — old sparkline builder, replaced by renderSnapshotCharts
- Dead activePlan block / window._adaptivePlan fallbacks
- **ai(), buildAthleteContext(), generatePostRunFeedback(), maybeCompressCoachingMemory()** —
  all removed. Only one AI function remains: generateDailyPrescription() (Program tab button).
  coachingMemory field removed from defD and data structure entirely.
- prog-block-badge + prog-block-desc HTML divs in PROGRAM tab
- **D.adaptivePlanCache** — removed from defD() (was only populated by the now-deleted adaptive plan system)
- **D.recoveryLogs[]** — removed from defD() (was written by deleted AI functions, never read)
- **D.volumeBests{}** — removed from defD() (was used by buildAthleteContext which was deleted)
- **D.adherence{}** — removed from defD() and saveSession() write sites (was incremented but never read or displayed)
- **Fixed % HRV/RHR thresholds**: ATHLETE.HRV_CRASH and ATHLETE.HRV_WARNING removed.
  HRV and RHR rules now use 60-day rolling z-score baseline in evaluateTrainingStatus().
- **Shared yExercise axis for exercise+calories**: exercise minutes and active calories were
  briefly on one shared right axis after the May 2026 snapshot restructure. Split into
  separate yExercise (purple) and yCalories (orange, offset) axes so calorie data can't
  squish the exercise minutes line. `||null` → `??null` on all health data mapping.
- `||null` falsy-zero bug on health data mapping (0 exercise minutes was treated as null/gap)
- **GOALS/MILESTONES tab**: removed entirely from both mobile and desktop nav
- **RULES tab**: removed from nav; rules content moved to collapsible drawer in Settings
- **AI flow diagrams on mobile**: `.desktop-only` class hides them on mobile, visible on desktop only
- **openFuelDrawer(), closeFuelDrawer(), buildFuelDrawerContent()**: legacy fuel drawer — 0 call sites after calendar redesign
- **calcRunMetrics()**: dead function — run metrics computed inline in renderRunMetricsSummary
- **setRunChart()**: dead wrapper — renderRunChart() called directly
- **formatSleepInput()**: dead function — sleep input handled without reformatting
- **detectBlockWeek() + getBlockParams()**: 4-week block wave (Volume/Strength/Peak/Deload)
  that drove chart targets but never prescriptions — replaced by the engine
  (prescribeLift double progression + detectDeload auto-deload)
- **Old Sonnet do-everything prescription call**: 2500-token claude-sonnet-4-6 call that
  computed weights via prompt rules (and misapplied them; row data was never sent, causing
  systematically lowballed row prescriptions) — replaced by deterministic engine + Haiku garnish
- **Dead CSS clusters removed**: `ap-*` (adaptive plan), `spark-*` (sparklines), `pbw/pbl/pbb/pbf` (progress bars),
  `bbar/bfill` (bar fill), `ex-plan`, `cal-rest`, `cal-badge.run-*`, `ride-stat-box`,
  `prog-exercises/ex-note/collapsed-body`, `wn-dot`
