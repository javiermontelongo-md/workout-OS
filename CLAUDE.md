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
TODAY · LOG SESSION · THIS WEEK · PROGRESS · PROGRAM · MILESTONES · RULES · SETTINGS

## Tab Roles (post-refactor)
- **TODAY**: workout-type dropdown (Push/Pull/Legs/Run/Cycling/Rest) + duration (30/60/90 min) + "Get Prescription" button + brief summary
- **PROGRAM**: today's full prescription from `D.dailyPrescriptions[today]` only — no other days
- **THIS WEEK**: monthly calendar (May 2026 floor, current month ceiling, ← → arrows) with indigo lift dots + jade run dots, clickable to open session drawer; session history list (paginated 10 at a time, newest-first, ← Older / Newer →); 7-day AI suggestions from last prescription's weekPlan
- **LOG SESSION**: planned values pre-filled from `D.dailyPrescriptions[today]`; weight input placeholders always match the recommended weights (via DEF[] mutation + renderSets re-render in updateLogTabPlanned)

## Key data.json fields
`sessions[]` · `runs[]` · `checkins[]` · `healthLogs[]` ·
`healthLastSync` · `stravaLastSync` · `adaptivePlanCache` ·
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

### Typography
```
body font-size: 26px   (base)
line-height:    1.7
--mono: 'DM Mono', monospace
--serif: 'Fraunces', serif
--sans: 'DM Sans', sans-serif

Font scaling rule (desktop CSS, lines 17-800):
  >= 26px  →  × 0.9  (big elements shrink ~10%)
  22-25px  →  unchanged (mid-range)
  <= 21px  →  × 1.2  (small labels grow ~20%)
Mobile media query (@media max-width:768px, line 801+) is NOT affected.

Key desktop sizes (current):
  .logo          28px   header wordmark
  .tab           25px   nav tab labels
  .ptag / .spill 24px   header badges + sync status
  .h1            29px   section headings
  .sv            32px   stat card values
  .btn           25px   all buttons
  input/select   23px   form fields (mid-range, unchanged)
  .bdg           24px   inline badges
  .cal-date      22px   calendar day numbers (mid-range)
  .cal-hdr       23px   SUN/MON/... column headers
```

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

/* Mobile override (~line 816) */
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

### Calendar Dot Classes (THIS WEEK month grid)
```css
.cal-dot          { display:inline-block; width:8px; height:8px; border-radius:50%; margin:0 2px; }
.cal-dot.lift     { background:var(--a); }   /* indigo — strength sessions */
.cal-dot.run      { background:var(--a2); }  /* jade — runs (Strava or logged) */
.cal-dots         { text-align:center; margin-top:3px; }
.cal-cell.cal-empty { background:transparent; border-color:transparent; pointer-events:none; }
```

### New DOM IDs (THIS WEEK panel)
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
| 2054 | lCFG() | Load config from localStorage |
| 2058 | sCFG() | Save config to localStorage |
| 2064 | fetchData() | GET data.json from GitHub API |
| 2088 | mergeRemoteD(remoteD) | Merge remote data.json with local defaults on load |
| 2103 | gitPush(commitMsg) | 3-retry GitHub PUT helper — handles 409 SHA conflicts; called by push() and pushSilent() |
| 2121 | push(btnId, msgId) | PUT data.json to GitHub API with UI feedback |
| 2139 | defD() | Default data structure — all data.json fields |
| 4042 | pushSilent() | Silent PUT data.json — no UI feedback |

### Boot & Navigation
| Line | Function | Purpose |
|------|----------|---------|
| 2157 | hOv() | Hover handlers |
| 2159 | onLoad() | App boot — fetches data, migrates runPrescriptions→dailyPrescriptions, renders tabs |
| 2179 | renderSystemLog() | System activity feed — merges runPrescriptions + dailyPrescriptions for display |
| 2342 | renderRulesTab() | RULES tab render with live hard rule status |
| 2371 | showTab(n) | Single nav function — all tab switching goes here; calls renderCalendar()+renderSessionList() for 'week' |
| 2381 | renderTab(n) | Renders content for a given tab |
| 2391 | sync(state, label) | Sync status indicator |
| 2397 | msg(id, html) | Inline message renderer |

### Appearance & Theme
| Line | Function | Purpose |
|------|----------|---------|
| 1904 | showFsTab(pane) | Switch between font size panes in Settings |
| 1912 | applyAppearance() | Apply all saved appearance settings on boot |
| 1933 | setTheme(name) | Apply and persist theme |
| 1934 | setFontPair(name) | Apply and persist font pair |
| 1935 | setFontSize(px) | Apply and persist font size |
| 1936 | applyAppearanceChanges() | Save all appearance changes from Settings form |

### Settings & Config UI
| Line | Function | Purpose |
|------|----------|---------|
| 2400 | setTrainingMode(val) | Sets D.trainingMode |
| 2803 | saveCFG() | Save settings |
| 2810 | testCon() | Test GitHub connection |
| 2818 | saveAPI() | Save Anthropic API key |
| 2819 | clearAPI() | Clear API key |
| 2820 | debugAPI() | Debug API key state |
| 2831 | runMig() | Run data migrations |
| 2846 | exportData() | Export data.json |
| 2847 | clrCFG() | Clear all config |

### AI Layer
| Line | Function | Purpose |
|------|----------|---------|
| 2852 | spin(id) | Spinner toggle helper |
| 2853 | liftTrend(key, sessions, weeks=4) | Computes 'improving'/'plateauing'/'declining'/'insufficient_data' for a lift key over N weeks |
| 2871 | buildAthleteContext() | Single shared context object for all AI calls. Returns athlete (with goals + vo2maxEstimate), hardRules, biometrics, training, checkin, body. Calls evaluateTrainingStatus() once. |
| 3030 | ai(prompt, maxTokens=800) | Shared Anthropic fetch wrapper — system prompt built from buildAthleteContext(). All AI calls route here. |
| 3883 | generatePostRunFeedback(targetDate) | Post-run feedback — requires D.dailyPrescriptions[targetDate] (fallback to runPrescriptions) AND matching Strava run. Compares prescribed vs actual. Calls renderRunLogCard(). |
| 4050 | generateDailyPrescription(workoutType, durationMins) | **Primary prescription entry point.** Single direct API call (claude-sonnet-4-5, 2500 tokens). Produces todayPrescription + weekPlan (7-day suggestions). Stores to D.dailyPrescriptions[today]. Calls renderPrescriptionCard, renderWeekSuggestions, updateLogTabPlanned, pushSilent. |
| 4230 | maybeCompressCoachingMemory() | Compresses oldest 15 coaching notes to structured profile if ≥15 notes. Stores to D.coachingMemory.compressed. Anti-drift: only structured observations, never prose fed back as AI input. |

### Hard Rule Engine
| Line | Function | Purpose |
|------|----------|---------|
| 3927 | compute7DayMeans() | Rolling 7-day HRV/RHR averages with fallback to ATHLETE baselines |
| 3942 | evaluateTrainingStatus() | 28-rule deterministic engine. Called in buildAthleteContext() and renderRulesTab(). Returns TrainingStatus: canTrain, canDoQuality, canDoHeavyLifts, liftRPECap, volumeModifier, stressScore, activeFlags, reasons, mafHR |

### Session Logging
| Line | Function | Purpose |
|------|----------|---------|
| 2410 | chk(id) | Checkbox toggle + D.checks persistence — used by Milestones tab only |
| 2417 | restChk() | Restore checkbox state from D.checks on load — used by Milestones tab only |
| 2429 | initSets() | Initialize set tracking state |
| 2430 | addSet(lift) | Add a set to a lift block |
| 2435 | removeSet(lift, i) | Remove a set from a lift block |
| 2436 | renderSets(lift) | Render set inputs for a lift |
| 2444 | saveSession() | Save session to D.sessions[] |
| 2478 | resetLogForm() | Reset log form to defaults |
| 2482 | renderSessHist() | Render session history list (LOG tab legacy view) |
| 3782 | toggleRunLogSection() | Show/hide run inputs |
| 3787 | onDayTypeChange(value) | Shows correct lift blocks per day type; calls renderRunLogCard() for run types |
| 3826 | startLoggingSession() | Navigate to LOG tab and set day type from presc-workout-type dropdown |
| 3834 | renderRunLogCard(targetDate) | Renders run prescription summary in LOG tab run card. Reads dailyPrescriptions first, falls back to runPrescriptions. Manages markRunComplete/postRunFeedback complete area. |
| 3875 | markRunComplete(targetDate) | Mark run complete in dailyPrescriptions (fallback runPrescriptions). Calls renderRunLogCard(). |
| 4267 | renderPrescriptionCard(prescription) | Renders full prescription in #prog-today-card. Handles push/pull/legs (lift table + accessories) and run/cycling (mainSet/pace/HR). Shows reasoning, warmup, cooldown, coachNote, ifTooHard, watchOutFor. |
| 4311 | renderWeekSuggestions(weekPlan) | Renders 7-day confidence grid in #week-suggestions. Shows date/dow + suggestion + confidence badge (HIGH/MED/LOW) + reason. |
| 4328 | confirmRPE(lift, actualRPE) | RPE confirmation after session |
| 4388 | updateLogTabPlanned() | Pre-fill planned values in LOG tab from D.dailyPrescriptions[today]. Mutates DEF[] and re-renders sets so weight placeholders always match prescription. Falls back to window._adaptivePlan. |
| 4420 | showRPEConfirm(lift) | RPE confirmation UI |

### Check-in
| Line | Function | Purpose |
|------|----------|---------|
| 4433 | calcFatigue(energy,sleep,soreness,motivation,stress) | Computes fatigueScore 0-10 |
| 4438 | updateFatiguePreview() | Live fatigue preview in check-in UI |
| 4450 | togglePostCall() | POST_CALL flag toggle — blocks all quality/heavy |
| 4460 | saveCheckin() | Save check-in to D.checkins[] |
| 4505 | _buildSparkRows(checkins30, larger) | Sparkline row builder for snapshot |
| 4540 | renderSnapshotCharts() | Render check-in snapshot charts |
| 4729 | initCheckinTab() | Initialize check-in tab |

### Calendar & Week View (THIS WEEK tab)
| Line | Function | Purpose |
|------|----------|---------|
| 2499 | updProgressStats() | Update progress tab stats |
| 2522 | getSessionsForDate(dateStr) | Filter D.sessions[] for a given date string |
| 2526 | getActivityBadges(sessions, dateStr) | Activity badge HTML for calendar cells |
| 2540 | getPlannedBadge(dateStr) | Planned workout badge for calendar cells |
| 2549 | calNav(dir) | Month calendar navigation — clamps to May 2026 floor and current month ceiling |
| 2556 | renderCalendar() | Full month grid render — blank leading cells, lift/run dots per day, disables nav at limits, summary "X strength · Y runs" |
| 2609 | handleDayCardClick(dateStr) | Day card click — past lift→drawer, past Strava-only run→fake-session drawer, future→program tab |
| 2621 | openSessionDrawer(session, dateStr) | Slide-in session detail drawer |
| 2644 | closeSessionDrawer() | Dismiss session drawer |
| 2653 | buildSessionDrawerContent(session, dateStr) | Full session detail HTML; includes Edit button for real logged sessions (session.ts present in D.sessions[]) |
| 2695 | openSessionDrawerByTs(ts) | Look up session in D.sessions[] by ts, open drawer |
| 2699 | renderSessionList() | Render paginated session history (10/page, newest-first) into #sess-list-rows + #sess-list-nav; covers all activity types |
| 2731 | editSession(ts) | Find session by ts, replace drawer content with buildEditForm output |
| 2738 | buildEditForm(session) | Full edit form HTML — session-type select, lift blocks (weight/reps/RPE per set + per-lift notes), cardio fields (dist/dur/HR/RPE/notes), session notes textarea, Save/Cancel |
| 2760 | saveEditedSession(ts) | Collect form values, update D.sessions[idx], call recalcE1RMs(), gitPush, refresh calendar + session list, reopen drawer |
| 2792 | recalcE1RMs() | Reset D.currentLifts to hardcoded defaults then replay all sessions to recompute e1RMs from scratch |

### Prescription & Program
| Line | Function | Purpose |
|------|----------|---------|
| 3084 | detectBlockWeek() | Block week 1-4, resets on <3 sessions in 14 days |
| 3117 | getBlockParams(blockWeek) | Sets/reps/targetRPE per block week |
| 3122 | buildPredictions(currentE1RM, slope) | 4-week e1RM projections |
| 3133 | predictLift(liftKey, blockWeek) | Predicted e1RM for a lift |
| 3160 | getAccessoryVariation(liftKey) | Accessory exercise variation string |
| 4345 | renderPredictionChart(lift) | e1RM prediction chart |
| 4382 | setChartLift(lift) | Set active lift for prediction chart |

### Run Metrics
| Line | Function | Purpose |
|------|----------|---------|
| 3065 | calcE1RM(weight, reps) | Epley e1RM formula, rounded to 2.5lb |
| 3067 | getLiftHistory(liftKey, daysBack=60) | Filter sessions, compute e1RM with recency weights |
| 3168 | localDS(d) | Date → YYYY-MM-DD string in local timezone |
| 3169 | getRestingHR() | Latest RHR from healthLogs |
| 3175 | estimateVO2max(run) | VO2max estimate from single run w/ HR. Requires run.heartRateAvg + distanceMi≥2. Returns null if no arg. |
| 3202 | vdotPredict(vo2max) | VDOT pace predictions |
| 3226 | riegelPredict(runs) | Riegel race prediction |
| 3251 | hrRegressionPredict(runs) | HR regression pace prediction |
| 3284 | calcRacePredictions() | Full race prediction calculation |
| 3390 | secsToRaceTime(s) | Format seconds as race time |
| 3399 | secsToPace(totalSecs, miles) | Format seconds as pace |
| 3407 | renderRacePredictions() | Render race prediction cards |
| 3487 | setRacePredChart(dist) | Set active race pred chart distance |
| 3496 | renderRacePredChart(dist) | Render race prediction chart |
| 3690 | calcRunMetrics() | Compute run metrics from D.runs |
| 3709 | renderRunMetricsSummary() | Render run metrics summary |
| 3732 | renderRunChart(type) | Render run chart (pace/HR/distance) |
| 3781 | setRunChart(type) | Set active run chart type |

### Body Metrics
| Line | Function | Purpose |
|------|----------|---------|
| 4755 | formatSleepInput(input) | Format sleep input string |
| 4766 | parseSleepHHMM(str) | Parse HH:MM sleep string to hours |
| 4774 | updateBodyCalcs() | Update BMI + body calc display |
| 4788 | renderBodyChart(type) | Render body metrics chart |
| 4832 | setBodyChart(type) | Set active body chart type |

---

## AI Architecture

### Call Hierarchy
```
buildAthleteContext()  ← called once per AI invocation
  └── evaluateTrainingStatus()   ← hard rules, single call
  └── compute7DayMeans()         ← biometrics
  └── detectBlockWeek()          ← block state (cached in const)
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
mafHR: 147  (getter: 180 − age − mafModifier)
mafModifier: −5
hrvBaseline: 53.5ms   (95 days Apple Watch Feb–May 2026)
rhrBaseline: 57.2bpm  (95 days Apple Watch Feb–May 2026)
sleepBaseline: 7.1h
HRV_CRASH: 0.80
HRV_WARNING: 0.90
RHR_SPIKE: 8
FEVER_TEMP: 1.5
SLEEP_BLOCK: 5.0
SLEEP_WARNING: 6.5

goals: {
  primary:         'sub-20 5K'
  secondary:       'increase VO2max'
  approach:        'polarized training — 80% easy zone 2, 20% quality work'
  currentEstimate5K: null
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
                 ⚠ 56 Shortcut-era entries were stored as absolute°F; corrected May 2026
sleepHours:      hours, 1 decimal — time ASLEEP (not time in bed); ~20–45 min less than
                 the "Time in Bed" value shown in Apple Health
sleepDeep:       hours (float) — HAE only, available from ~May 21 2026
sleepREM:        hours (float) — HAE only, available from ~May 21 2026
sleepLight:      hours (float, Apple 'core' stage) — HAE only
sleepAwake:      hours (float) — HAE only, populated from sleepEntry.awake field
                 (NOT computed from inBed−totalSleep; inBed is always 0 in HAE)
steps:           integer — Apple Watch + iPhone combined (HAE deduplicates)
exerciseMinutes: integer — Apple Watch Exercise ring minutes
walkingHR:       bpm (integer) — Apple Watch average walking HR
respiratoryRate: breaths/min (float) — Apple Watch overnight
vo2maxApple:     ml/kg/min (float) — Apple Watch estimate, updates ~weekly; null most days
```

### Health Sync Infrastructure
- Workflow: `.github/workflows/health-sync.yml` — triggered by HAE `repository_dispatch`
- Script:   `.github/scripts/health-sync.js` — parses HAE JSON, upserts healthLogs by date
- Concurrency: `group: health-sync, cancel-in-progress: false` prevents race condition
  when HAE fires duplicate webhooks (queues runs instead of racing to push)
- Push safety: `git pull --rebase` before `git push` in the workflow commit step
- HAE sends `step_count` as a float (merged Watch+iPhone samples) — script rounds to int
- HAE sends `walking_heart_rate_average` as a float — script rounds to int
- HAE sends `apple_sleeping_wrist_temperature` with multiple date entries — script uses
  `getMetricForDate()` to match the target date, not just `data[0]`

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
| `calMonthOffset` | `0` | Months relative to current month for the THIS WEEK calendar (0 = now, -1 = last month). Replaces old `calOffset` (week offset). |
| `sessionListPage` | `0` | Current page index for the session history list (0 = most recent 10). |

## What Has Been Removed
- var DP, DAYS, DT, DC objects (dead vars — deleted)
- var weekNavOffset (dead — week nav system removed)
- var calOffset (dead — replaced by calMonthOffset for month-based navigation)
- getWeekStart(offset) — returns week start date; removed when calendar switched from 7-day week view to full month grid
- .ap-confidence-badge CSS rules (dead — renderAdaptivePlan deleted)
- Hardcoded cardio struct in saveSession()
- Legacy pullups:{sets,reps} aggregate in saveSession()
- pu-sets and pu-reps input elements
- plan-debug console.log lines
- Old BIOMETRIC RULES hardcoded prose in buildPlanPrompt()
- Hardcoded "Kaiser SF" string in ai() system prompt
  (now lives in buildAthleteContext().athlete.location)
- Duplicate evaluateTrainingStatus() calls — now single call in buildAthleteContext()
- Dead top-level coachingLog.push/pushSilent/renderSystemLog statements (were executing at page load — moved inside function body)
- **genToday() + fai() + modeChg() (removed):** AI coaching narrative on TODAY tab removed as redundant — prescription already contains coachNote, ifTooHard, watchOutFor. Also removed: today_coaching coachingLog label, recentCoaching field from buildAthleteContext() training return, today-out DOM element and all references.
- runDayMap — removed, card reads D.runPrescriptions[targetDate] directly
- Old run prescription JSON shape: primaryRecommendation{distance,pace,hrCap,effort,notes}
  (replaced by: recommendedType, reasoning, workout{...}, ifTooHard, watchOutFor[])
- estimateVO2max() called with no arg (always returned null)
  (fixed: IIFE finds most recent run with heartRateAvg + distanceMi≥2)
- **Entire schedule/plan system (27 functions, Commit 3):**
  buildSchedule, applyScheduleOverride, confirmDayOverride, buildLocalPlan,
  buildPlanContext, buildPlanPrompt, parsePlanResponse, generateAdaptivePlan,
  renderAdaptivePlan, getDayProgram, renderDayCard, toggleProgDay, renderProgramTab,
  renderWeekNavLifts, renderWeekNav, weekNavNav, getWeekLabel, getWeekDateRange,
  getBlockPhaseForOffset, getActualLiftsForWeek, getPlannedLiftsForWeek,
  ldPrev, buildRunProfile, generateRunPrescription, renderRunPrescriptionCard,
  updateTodayPreview, getTodayDayType, buildPrescriptionString
- **Replaced by:** generateDailyPrescription (single AI call → prescription + 7-day plan),
  renderPrescriptionCard, renderWeekSuggestions, renderRunLogCard,
  maybeCompressCoachingMemory
- SESSION CHECKLIST card from Today tab (ci-wu/ci-mn/ci-ac/ci-cd/ci-lg/ci-pr/ci-sl)
  chk() and restChk() retained — still used by Milestones tab checkboxes (mhw1–mhw7)
- REDUCE IF: and REDUCTION ORDER: cards from Today tab (g2 grid wrapper removed too)
  Content lives in RULES tab — was redundant on Today
- scheduleOverrides — D.scheduleOverrides field (defD), override dot (calendar),
  overrides context block (buildAthleteContext) — nothing ever wrote to it after
  the schedule system was removed; was always passing {} to the AI
- **Health sync data quality fixes (May 2026):**
  - Removed 3 bad Shortcut-era healthLog entries: May 7 (51k steps), May 16 (47k steps /
    166 min exercise — the day Shortcut was removed), May 23 (exact duplicate of May 21)
  - Rounded 21 float steps+walkingHR values in existing entries to integers
  - Converted 56 wristTemp entries from absolute°F → delta°C (Shortcut stored raw °F;
    HAE stores °F but health-sync.js converts to delta°C on ingest)
- **health-sync.js fixes (May 2026):**
  - steps: Math.round() — HAE sends float (merged Watch+iPhone samples)
  - walkingHR: Math.round() — HAE sends float
  - wristTemp: getMetricForDate() — was taking data[0] which could be prior day's reading
  - sleepAwake: reads sleepEntry.awake directly — was computing from inBed which HAE
    always sends as 0, so sleepAwake was always null
- **health-sync.yml fixes (May 2026):**
  - concurrency group added — HAE fires duplicate webhooks; without this, parallel runs
    raced to push and 3 of 4 would fail with "failed to push some refs"
  - git pull --rebase added before git push
