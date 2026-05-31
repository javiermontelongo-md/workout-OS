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
TODAY · PROGRAM · LOG SESSION · ACTIVITY · PROGRESS · MILESTONES · RULES · SETTINGS

## Tab Roles
- **TODAY**: check-in sliders (energy/soreness/motivation/stress/sleep/weight) + recovery snapshot charts + system activity log
- **PROGRAM**: workout-type dropdown (Push/Pull/Legs/Run/Cycling/Rest) + duration (30/60/90 min) + "Get Prescription" button + full prescription card + AI flow diagram
- **LOG SESSION**: lift set blocks + run log card; planned values pre-filled from `D.dailyPrescriptions[today]`; weight input placeholders match prescription (via DEF[] mutation + renderSets re-render in updateLogTabPlanned)
- **ACTIVITY**: monthly calendar (May 2026 floor, current month ceiling, ← → arrows) with indigo lift dots + jade run dots, clickable to open session drawer; paginated session history list (10/page, newest-first); volume records; 7-day AI suggestions from last prescription's weekPlan
- **PROGRESS**: e1RM prediction chart + run metrics + VO2max trend chart + race predictions + body metrics chart
- **RULES**: live hard-rule engine status (all 8+ flags with live thresholds)

## Key data.json fields
`sessions[]` · `runs[]` · `checkins[]` · `healthLogs[]` ·
`healthLastSync` · `stravaLastSync` ·
`runPrescriptions{}` · `dailyPrescriptions{}` · `coachingMemory{}` ·
`coachingLog[]` · `bodyMetrics[]`

## Lift Keys
`bench` · `ohp` · `pullup` · `row` · `squat` · `dl`

---

## CSS Design Tokens

### Color Palette (`:root`)
```
/* Backgrounds */
--bg: #080a10        base page background
--s1: #0f1219        card surface (level 1)
--s2: #141824        inner surface (level 2)
--s3: #1a1f2e        elevated surface (level 3)
--s4: #1f2538        top surface (level 4)

/* Borders */
--b:  rgba(104,110,210,0.25)   card outlines
--b2: rgba(104,110,210,0.42)   inner dividers
--b3: rgba(104,110,210,0.58)   emphasis borders

/* Accent */
--a:  #6870c8   indigo   (primary CTA, active nav)
--a2: #2aa070   jade     (positive / run)
--a3: #3d88d4   blue     (info)
--a4: #c24d72   rose     (alert)
--a5: #a066d4   violet   (secondary accent)
--aw: #b86035   amber    (warning / if-too-hard)
--red: #e85d8a

/* Text */
--t:  #e2eaf8   primary body text
--t2: #a8b4cc   secondary labels, subtext
--t3: #7e8caa   tertiary hints, timestamps
```

### Typography & Font System
The app uses a two-level font system:

**Base size** — controls body text. Set via font preset buttons (XS/S/M/L/XL) or saved
to localStorage as `wos-fontsize`. Default: 19px.

**Component sizes** — per-component sliders in Settings override individual elements.
Stored in localStorage as `wos-comp-fs` (desktop) and `wos-comp-fs-mobile`.
Components: logo, nav, heading, sublabel, badge, input, btn, cardtext, exercise,
dataval, caltext, mono, presctext (desktop); m_mlogo, m_nav, m_navlbl, m_heading,
m_label, m_input, m_btn, m_cardtext (mobile).

**CSS variables (`:root`)** — auto-managed by applyAppearance():
```
--fs-xs:           19px   (small labels, timestamps, mono tags)
--fs-sm:           22px   (secondary text, check-in labels)
--fs-presc-text:   13px   (prescription body text — separate slider)
--fs-presc-lift:   13px   (lift row text — separate slider)
```

**Font presets** (applyFontPreset):
```
XS = 14px base   S = 17px   M = 19px (default)   L = 22px   XL = 26px
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
| 2259 | lCFG() | Load config from localStorage |
| 2263 | sCFG() | Save config to localStorage |
| 2269 | fetchData() | GET data.json from GitHub API |
| 2293 | mergeRemoteD(remoteD) | Merge remote data.json with local defaults on load |
| 2308 | gitPush(commitMsg) | 3-retry GitHub PUT helper — handles 409 SHA conflicts; called by push() and pushSilent() |
| 2326 | push(btnId, msgId) | PUT data.json to GitHub API with UI feedback |
| 2344 | defD() | Default data structure — all data.json fields |
| 4428 | pushSilent() | Silent PUT data.json — no UI feedback |

### Boot & Navigation
| Line | Function | Purpose |
|------|----------|---------|
| 2361 | hOv() | Dismiss loading overlay |
| 2363 | onLoad() | App boot — fetches data, migrates runPrescriptions→dailyPrescriptions, renders tabs |
| 2381 | renderSystemLog() | System activity feed — merges runPrescriptions + dailyPrescriptions for display |
| 2530 | renderRulesTab() | RULES tab render with live hard rule status + z-score thresholds |
| 2559 | showTab(n) | Single nav function — calls renderCalendar()+renderSessionList()+renderProgressSessions() for 'week'; renderRulesTab() for 'rules'; _syncAppearanceUI() for 'settings' |
| 2570 | renderTab(n) | Renders content for a given tab (runs once per tab, cached in `rendered{}`) |
| 2540 | sync(state, label) | Sync status indicator |
| 2546 | msg(id, html) | Inline message renderer |

### Appearance & Theme
| Line | Function | Purpose |
|------|----------|---------|
| 1978 | _applyComponentFontSizes() | Apply all desktop component font size overrides from localStorage |
| 1992 | _applyMobileComponentFontSizes() | Apply all mobile component font size overrides from localStorage |
| 2002 | setComponentFontSize(key, px) | Set one desktop component font size, persist, re-apply all |
| 2007 | setMobileComponentFontSize(key, px) | Set one mobile component font size, persist, re-apply all |
| 2012 | showFsTab(pane) | Switch between 'desktop' and 'mobile' panes in font size Settings |
| 2020 | applyAppearance() | Apply all saved appearance settings on boot (theme, font pair, base size, component sizes, small text) |
| 2044 | setTheme(name) | Apply and persist theme |
| 2045 | setFontPair(name) | Apply and persist font pair |
| 2046 | setFontSize(px) | Apply and persist base font size |
| 2047 | setSmallTextSize(px) | Apply and persist small text floor (--fs-xs / --fs-sm). Range 22–30px. |
| 2065 | applyFontPreset(px) | Apply XS/S/M/L/XL font preset (14/17/19/22/26px), sync preset button highlights |
| 2097 | applyAppearanceChanges() | Save all appearance changes from Settings form |
| 2119 | _syncFontPresetBtns(px) | Highlight the matching preset button for a given base size |
| 2157 | _syncAppearanceUI() | Populate Settings appearance fields from localStorage on tab open |

### Settings & Config UI
| Line | Function | Purpose |
|------|----------|---------|
| 3127 | saveCFG() | Save GitHub token + repo settings |
| 3134 | testCon() | Test GitHub connection |
| 3102 | saveAPI() | Save Anthropic API key |
| 3103 | clearAPI() | Clear API key |
| 3104 | debugAPI() | Debug API key state |
| 3155 | runMig() | Run data migrations |
| 3170 | exportData() | Export data.json |
| 3171 | clrCFG() | Clear all local config |

### AI Layer
| Line | Function | Purpose |
|------|----------|---------|
| 3176 | liftTrend(key, sessions, weeks=4) | Computes 'improving'/'plateauing'/'declining'/'insufficient_data' for a lift key over N weeks |
| 3194 | buildAthleteContext() | Single shared context object for all AI calls. Returns athlete (with goals + vo2maxEstimate), hardRules, biometrics, training, checkin, body. Calls evaluateTrainingStatus() once. |
| 3319 | ai(prompt, maxTokens=800) | Shared Anthropic fetch wrapper — system prompt built from buildAthleteContext(). All AI calls route here. |
| 4245 | generatePostRunFeedback(targetDate) | Post-run feedback — requires D.dailyPrescriptions[targetDate] AND matching Strava run. Compares prescribed vs actual. Calls renderRunLogCard(). |
| 4436 | generateDailyPrescription(workoutType, durationMins) | **Primary prescription entry point.** Direct API call (claude-sonnet-4-5, 2500 tokens). Produces todayPrescription + weekPlan[7]. Stores to D.dailyPrescriptions[today]. Calls renderPrescriptionCard, renderWeekSuggestions, updateLogTabPlanned, pushSilent. |
| 4627 | maybeCompressCoachingMemory() | Compresses oldest 15 coaching notes to structured profile if ≥15 notes. Stores to D.coachingMemory.compressed. |

### Hard Rule Engine
| Line | Function | Purpose |
|------|----------|---------|
| 4289 | compute7DayMeans() | Rolling 7-day HRV/RHR averages + 60-day personal z-score baseline. Returns: hrv, rhr, count, hrvBaseline60, hrvSD60, hrv60Count, rhrBaseline60, rhrSD60, rhr60Count. Falls back to ATHLETE.hrvBaseline/rhrBaseline if <30 days of data. |
| 4321 | evaluateTrainingStatus() | Deterministic rule engine. Uses 60-day z-score baseline (not fixed % thresholds) for HRV/RHR. Called in buildAthleteContext() and renderRulesTab(). Returns: canTrain, canDoQuality, canDoHeavyLifts, liftRPECap, volumeModifier, stressScore, activeFlags, reasons, mafHR, latestHRV, latestRHR, sleepHours, means. |

### Session Logging
| Line | Function | Purpose |
|------|----------|---------|
| 2592 | chk(id) | Checkbox toggle + D.checks persistence — used by Milestones tab only |
| 2599 | restChk() | Restore checkbox state from D.checks on load — used by Milestones tab only |
| 2611 | initSets() | Initialize set tracking state |
| 2612 | addSet(lift) | Add a set to a lift block |
| 2617 | removeSet(lift, i) | Remove a set from a lift block |
| 2618 | renderSets(lift) | Render set inputs for a lift |
| 2626 | saveSession() | Save session to D.sessions[] |
| 2677 | resetLogForm() | Reset log form to defaults |
| 2686 | renderSessHist() | Render session history list (LOG tab legacy view) |
| 4149 | onDayTypeChange(value) | Shows correct lift blocks per day type; calls renderRunLogCard() for run types |
| 4188 | startLoggingSession() | Navigate to LOG tab and set day type from presc-workout-type dropdown |
| 4196 | renderRunLogCard(targetDate) | Renders run prescription summary in LOG tab run card. Reads dailyPrescriptions first, falls back to runPrescriptions. Manages markRunComplete/postRunFeedback complete area. |
| 4237 | markRunComplete(targetDate) | Mark run complete in dailyPrescriptions. Calls renderRunLogCard(). |
| 4664 | renderPrescriptionCard(prescription) | Renders full prescription in #prog-today-card. Handles push/pull/legs (lift table + accessories) and run/cycling (mainSet/pace/HR). Shows reasoning, warmup, cooldown, coachNote, ifTooHard, watchOutFor. |
| 4745 | renderWeekSuggestions(weekPlan) | Renders 7-day confidence grid in #week-suggestions. Shows date/dow + suggestion + confidence badge (HIGH/MED/LOW) + reason. |
| 4762 | confirmRPE(lift, actualRPE) | RPE confirmation after session |
| 4842 | updateLogTabPlanned() | Pre-fill planned values in LOG tab from D.dailyPrescriptions[today]. Mutates DEF[] and re-renders sets so weight placeholders always match prescription. |
| 4935 | showRPEConfirm(lift) | RPE confirmation UI |

### Check-in
| Line | Function | Purpose |
|------|----------|---------|
| 4948 | calcFatigue(energy,sleep,soreness,motivation,stress) | Computes fatigueScore 0-10 |
| 4953 | updateFatiguePreview() | Live fatigue preview in check-in UI |
| 4965 | togglePostCall() | POST_CALL flag toggle — blocks all quality/heavy |
| 4975 | saveCheckin() | Save check-in to D.checkins[], then renderSnapshotCharts() |
| 5020 | renderSnapshotCharts() | Render 4 health snapshot charts (sleep / steps+exercise+cal / walking HR+speed / RHR+resp) |
| 5323 | initCheckinTab() | Initialize check-in tab — populate existing today values |

### Calendar & Activity View (ACTIVITY tab)
| Line | Function | Purpose |
|------|----------|---------|
| 2703 | computeVolumeBests() | Compute PR volume records (heaviest set per lift) from D.sessions[] |
| 2724 | updProgressStats() | Update progress tab e1RM stat cards |
| 2782 | getSessionsForDate(dateStr) | Filter D.sessions[] for a given date string |
| 2786 | calNav(dir) | Month calendar navigation — clamps to May 2026 floor and current month ceiling |
| 2793 | renderCalendar() | Full month grid render — blank leading cells, lift/run dots per day, disables nav at limits |
| 2846 | handleDayCardClick(dateStr) | Day card click — past lift→drawer, past Strava-only run→fake-session drawer, future→program tab |
| 2872 | openSessionDrawer(session, dateStr) | Slide-in session detail drawer |
| 2895 | closeSessionDrawer() | Dismiss session drawer |
| 2904 | buildSessionDrawerContent(session, dateStr) | Full session detail HTML; includes Edit button for real logged sessions |
| 2974 | openSessionDrawerByTs(ts) | Look up session in D.sessions[] by ts, open drawer |
| 2978 | renderSessionList() | Render paginated session history (10/page, newest-first) into #sess-list-rows + #sess-list-nav |
| 3010 | renderProgressSessions() | Render volume records + session summary on ACTIVITY tab |
| 3040 | editSession(ts) | Find session by ts, replace drawer content with buildEditForm output |
| 3047 | buildEditForm(session) | Full edit form HTML — session-type select, lift blocks, cardio fields, notes, Save/Cancel |
| 3072 | removeEditSet(key, i, ts) | Remove a set row from the in-drawer edit form |
| 3083 | saveEditedSession(ts) | Collect form values, update D.sessions[idx], call recalcE1RMs(), gitPush, refresh views, reopen drawer |
| 3116 | recalcE1RMs() | Reset D.currentLifts to hardcoded defaults then replay all sessions to recompute e1RMs from scratch |

### Prescription, Program & AI Flow
| Line | Function | Purpose |
|------|----------|---------|
| 3419 | detectBlockWeek() | Block week 1-4, resets on <3 sessions in 14 days |
| 3440 | getBlockParams(blockWeek) | Sets/reps/targetRPE per block week |
| 3445 | buildPredictions(currentE1RM, slope) | 4-week e1RM projections (optimistic/conservative dashed lines) |
| 3456 | predictLift(liftKey, blockWeek) | Predicted e1RM for a lift — called by renderPredictionChart, showRPEConfirm, confirmRPE |
| 4778 | renderPredictionChart(lift) | e1RM prediction chart — wired to predictLift(lift, detectBlockWeek()) |
| 4829 | setChartLift(lift) | Set active lift for prediction chart |
| 4834 | toggleEquationDrawer() | Show/hide the formula/equation explanation drawer on prediction chart |
| 5437 | renderAIFlowDiagram() | Render interactive SVG-style AI prescription flow diagram on PROGRAM tab |
| 5846 | afdShowDetail(nodeId) | Show detail panel for a node in the AI flow diagram |
| 5883 | afdCloseDetail() | Close the AI flow detail panel |

### Run Metrics
| Line | Function | Purpose |
|------|----------|---------|
| 3391 | calcE1RM(weight, reps) | Epley e1RM formula, rounded to 2.5lb |
| 3393 | getLiftHistory(liftKey, daysBack=60) | Filter sessions, compute e1RM with recency weights |
| 3484 | localDS(d) | Date → YYYY-MM-DD string in local timezone |
| 3485 | getRestingHR() | Latest RHR from healthLogs |
| 3491 | estimateVO2max(run) | VO2max estimate from single run w/ HR. Requires run.heartRateAvg + distanceMi≥2. Returns null if no arg. |
| 3529 | vdotPredict(vo2max) | VDOT pace predictions |
| 3553 | riegelPredict(runs) | Riegel race prediction |
| 3578 | hrRegressionPredict(runs) | HR regression pace prediction |
| 3611 | calcRacePredictions() | Full race prediction calculation |
| 3713 | secsToRaceTime(s) | Format seconds as race time |
| 3722 | secsToPace(totalSecs, miles) | Format seconds as pace |
| 3730 | renderRacePredictions() | Render race prediction cards |
| 3810 | setRacePredChart(dist) | Set active race pred chart distance |
| 3819 | renderRacePredChart(dist) | Render race prediction chart |
| 4013 | calcRunMetrics() | Compute run metrics from D.runs |
| 4032 | renderRunMetricsSummary() | Render run metrics summary |
| 4037 | renderRunChart() | Render combined pace/distance/HR chart for last 10 runs |
| 4102 | setRunChart() | Wrapper — calls renderRunChart() |
| 4103 | renderVO2TrendChart() | Render VO2max trend chart (calculated estimate + Apple Watch dots) on PROGRESS tab |

### Body Metrics
| Line | Function | Purpose |
|------|----------|---------|
| 5349 | formatSleepInput(input) | Format sleep input string |
| 5360 | parseSleepHHMM(str) | Parse HH:MM sleep string to hours |
| 5368 | updateBodyCalcs() | Update BMI + body calc display |
| 5382 | renderBodyChart(type) | Render body metrics chart |
| 5426 | setBodyChart(type) | Set active body chart type |

---

## AI Architecture

### Call Hierarchy
```
buildAthleteContext()  ← called once per AI invocation
  └── evaluateTrainingStatus()   ← hard rules, single call (z-score engine)
  └── compute7DayMeans()         ← 7-day biometrics + 60-day personal baseline
  └── detectBlockWeek()          ← block state
      └── getBlockParams()
  └── estimateVO2max(_bestHRRun) ← IIFE — finds latest run w/ HR + dist≥2

ai(prompt, maxTokens=800)  ← shared fetch wrapper
  └── buildAthleteContext()  ← system prompt built here
  └── called by:
      ├── maybeCompressCoachingMemory() (1200 tokens)
      └── generatePostRunFeedback()     (800 tokens)

generateDailyPrescription(workoutType, durationMins)  ← direct fetch
  └── maybeCompressCoachingMemory()  ← compress if ≥15 notes
  └── buildAthleteContext()          ← live biometrics + hard rules
  └── Direct Anthropic API (claude-sonnet-4-5, 2500 tokens)
  └── Produces: todayPrescription + weekPlan[7]
  └── Writes: D.dailyPrescriptions[today]
  └── Calls: renderPrescriptionCard(), renderWeekSuggestions(),
             updateLogTabPlanned(), pushSilent()
```

### evaluateTrainingStatus() Call Sites (2)
1. buildAthleteContext() — feeds all ai() calls
2. renderRulesTab() — live status display in RULES tab

### HRV/RHR Rule Engine (z-score, not fixed %)
HRV and RHR thresholds are NOT fixed percentages — they use a rolling 60-day personal
baseline (mean ± SD) computed by compute7DayMeans():
- **HRV Acute Crash** (flag: HRV_ACUTE_CRASH): latest HRV < baseline − 1.5 SD → blocks quality + heavy, volume ×0.75, RPE cap 6
- **HRV Warning** (flag: HRV_WARNING): latest HRV < baseline − 0.75 SD → volume ×0.85, RPE cap 7
- **RHR Spike** (flag: RHR_SPIKE): latest RHR > baseline + 1.5 SD → blocks quality, volume ×0.85, RPE cap 7
Requires ≥30 days of HRV/RHR data; falls back to ATHLETE.hrvBaseline/rhrBaseline if fewer.
The ATHLETE constant no longer stores HRV_CRASH or HRV_WARNING constants (those were fixed %).

### coachingLog Write Sites (2)
All use identical pattern: push → slice(-50) → renderSystemLog()
- generateDailyPrescription() → type: 'daily_prescription'
- generatePostRunFeedback() → type: 'post_run'

### coachingMemory Write Sites (2)
- generateDailyPrescription() → pushes structured note to D.coachingMemory.notes[]
- maybeCompressCoachingMemory() → compresses oldest 15 notes to D.coachingMemory.compressed

---

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
postRunFeedback: string (from generatePostRunFeedback)
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

## D.runs[] Entry Shape
```
date:         'YYYY-MM-DD'
type:         'run'
runType:      'easy' | 'long' | 'intervals' | 'tempo' | 'moderate'
              (NOTE: 'quality' filter must also include 'intervals' and 'tempo')
distanceMi:   miles (float)
paceMinkm:    pace (also aliased as r.pace)
heartRateAvg: bpm
heartRateMax: bpm
duration:     seconds
elevationGain: feet
```

## State Variables (global JS)
| Variable | Default | Purpose |
|----------|---------|---------|
| `calMonthOffset` | `0` | Months relative to current month for the ACTIVITY calendar (0 = now, -1 = last month). Floor: May 2026. |
| `sessionListPage` | `0` | Current page index for the session history list (0 = most recent 10). |

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
- Dead activePlan block in buildAthleteContext / window._adaptivePlan fallbacks
- prog-block-badge + prog-block-desc HTML divs in PROGRAM tab
- D.adaptivePlanCache=null in saveSession (adaptivePlanCache never populated)
- **Fixed % HRV/RHR thresholds**: ATHLETE.HRV_CRASH and ATHLETE.HRV_WARNING removed.
  HRV and RHR rules now use 60-day rolling z-score baseline in evaluateTrainingStatus().
- **Shared yExercise axis for exercise+calories**: exercise minutes and active calories were
  briefly on one shared right axis after the May 2026 snapshot restructure. Split into
  separate yExercise (purple) and yCalories (orange, offset) axes so calorie data can't
  squish the exercise minutes line. `||null` → `??null` on all health data mapping.
- `||null` falsy-zero bug on health data mapping (0 exercise minutes was treated as null/gap)
