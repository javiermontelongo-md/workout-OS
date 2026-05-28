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
- **THIS WEEK**: activity calendar + 7-day AI suggestions from last prescription's weekPlan
- **LOG SESSION**: planned values pre-filled from `D.dailyPrescriptions[today]`

## Key data.json fields
`sessions[]` · `runs[]` · `checkins[]` · `healthLogs[]` ·
`healthLastSync` · `stravaLastSync` · `adaptivePlanCache` ·
`runPrescriptions{}` · `dailyPrescriptions{}` · `coachingMemory{}` ·
`scheduleOverrides{}` · `coachingLog[]` · `bodyMetrics[]`

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

---

## Function Index
All line numbers are from origin/main. Verify before editing:
  git show origin/main:index.html | grep -n "function functionName"

### Config & Data
| Line | Function | Purpose |
|------|----------|---------|
| 1683 | lCFG() | Load config from localStorage |
| 1687 | sCFG() | Save config to localStorage |
| 1693 | fetchData() | GET data.json from GitHub API |
| 1722 | push(btnId, msgId) | PUT data.json to GitHub API |
| 1746 | defD() | Default data structure — all data.json fields |
| 3658 | pushSilent() | Silent PUT data.json — no UI feedback |

### Boot & Navigation
| Line | Function | Purpose |
|------|----------|---------|
| 1764 | hOv() | Hover handlers |
| 1766 | onLoad() | App boot — fetches data, migrates runPrescriptions→dailyPrescriptions, renders tabs |
| 1979 | showTab(n) | Single nav function — all tab switching goes here |
| 1988 | renderTab(n) | Renders content for a given tab |
| 1998 | sync(state, label) | Sync status indicator |
| 2004 | msg(id, html) | Inline message renderer |

### Settings & Config UI
| Line | Function | Purpose |
|------|----------|---------|
| 2011 | setTrainingMode(val) | Sets D.trainingMode |
| 2307 | saveCFG() | Save settings |
| 2314 | testCon() | Test GitHub connection |
| 2322 | saveAPI() | Save Anthropic API key |
| 2323 | clearAPI() | Clear API key |
| 2324 | debugAPI() | Debug API key state |
| 2335 | runMig() | Run data migrations |
| 2350 | exportData() | Export data.json |
| 2351 | clrCFG() | Clear all config |

### AI Layer
| Line | Function | Purpose |
|------|----------|---------|
| 2357 | liftTrend(key, sessions, weeks=4) | Computes 'improving'/'plateauing'/'declining'/'insufficient_data' for a lift key over N weeks |
| 2375 | buildAthleteContext() | Single shared context object for all AI calls. Returns athlete (with goals + vo2maxEstimate), hardRules, biometrics, training, checkin, body. Calls evaluateTrainingStatus() once. |
| 2551 | ai(prompt, maxTokens=800) | Shared Anthropic fetch wrapper — system prompt built from buildAthleteContext(). All AI calls route here. |
| 3673 | generateDailyPrescription(workoutType, durationMins) | **Primary prescription entry point.** Single direct API call (claude-sonnet-4-5, 2500 tokens). Produces todayPrescription (warmup/mainWork/cooldown/coachNote/ifTooHard/watchOutFor) + weekPlan (7-day suggestions with confidence). Stores to D.dailyPrescriptions[today]. Calls renderPrescriptionCard, renderWeekSuggestions, updateLogTabPlanned, pushSilent. |
| 3839 | maybeCompressCoachingMemory() | Compresses oldest 15 coaching notes to structured profile if ≥15 notes. Stores to D.coachingMemory.compressed. Anti-drift: only structured observations, never prose fed back as AI input. |
| 3499 | generatePostRunFeedback(targetDate) | Post-run feedback — requires D.dailyPrescriptions[targetDate] (fallback to runPrescriptions) AND matching Strava run. Compares prescribed vs actual. Calls renderRunLogCard(). |

### Hard Rule Engine
| Line | Function | Purpose |
|------|----------|---------|
| 3543 | compute7DayMeans() | Rolling 7-day HRV/RHR averages with fallback to ATHLETE baselines |
| 3558 | evaluateTrainingStatus() | 28-rule deterministic engine. Called in buildAthleteContext() and renderRulesTab(). Returns TrainingStatus: canTrain, canDoQuality, canDoHeavyLifts, liftRPECap, volumeModifier, stressScore, activeFlags, reasons, mafHR |

### Session Logging
| Line | Function | Purpose |
|------|----------|---------|
| 2021 | chk(id) | Checkbox toggle + D.checks persistence — used by Milestones tab only |
| 2028 | restChk() | Restore checkbox state from D.checks on load — used by Milestones tab only |
| 2040 | initSets() | Initialize set tracking state |
| 2041 | addSet(lift) | Add a set to a lift block |
| 2046 | removeSet(lift, i) | Remove a set from a lift block |
| 2047 | renderSets(lift) | Render set inputs for a lift |
| 2055 | saveSession() | Save session to D.sessions[] |
| 2089 | resetLogForm() | Reset log form to defaults |
| 2093 | renderSessHist() | Render session history list |
| 3398 | toggleRunLogSection() | Show/hide run inputs |
| 3403 | onDayTypeChange(value) | Shows correct lift blocks per day type; calls renderRunLogCard() for run types |
| 3442 | startLoggingSession() | Navigate to LOG tab and set day type from presc-workout-type dropdown |
| 3450 | renderRunLogCard(targetDate) | Renders run prescription summary in LOG tab run card. Reads dailyPrescriptions first, falls back to runPrescriptions. Manages markRunComplete/postRunFeedback complete area. |
| 3491 | markRunComplete(targetDate) | Mark run complete in dailyPrescriptions (fallback runPrescriptions). Calls renderRunLogCard(). |
| 3997 | updateLogTabPlanned() | Pre-fill planned values in LOG tab from D.dailyPrescriptions[today]. Falls back to window._adaptivePlan for backward compat. |
| 4026 | showRPEConfirm(lift) | RPE confirmation UI |
| 3937 | confirmRPE(lift, actualRPE) | RPE confirmation after session |

### Check-in
| Line | Function | Purpose |
|------|----------|---------|
| 4039 | calcFatigue(energy,sleep,soreness,motivation,stress) | Computes fatigueScore 0-10 |
| 4044 | updateFatiguePreview() | Live fatigue preview in check-in UI |
| 4056 | togglePostCall() | POST_CALL flag toggle — blocks all quality/heavy |
| 4066 | saveCheckin() | Save check-in to D.checkins[] |
| 4111 | _buildSparkRows(checkins30, larger) | Sparkline row builder for snapshot |
| 4146 | renderSnapshotCharts() | Render check-in snapshot charts |
| 4335 | initCheckinTab() | Initialize check-in tab |

### Calendar & Week View
| Line | Function | Purpose |
|------|----------|---------|
| 2132 | getWeekStart(offset) | Returns week start date for offset |
| 2138 | getSessionsForDate(dateStr) | Filter sessions for a date |
| 2142 | getActivityBadges(sessions, dateStr) | Activity badge HTML for calendar |
| 2156 | getPlannedBadge(dateStr) | Planned workout badge for calendar |
| 2165 | calNav(dir) | Calendar navigation |
| 2169 | renderCalendar() | Full calendar render |
| 2215 | handleDayCardClick(dateStr) | Day card click — past→drawer, future→program tab, rest→no-op |
| 2229 | openSessionDrawer(session, dateStr) | Slide-in session detail drawer |
| 2252 | closeSessionDrawer() | Dismiss session drawer |
| 2261 | buildSessionDrawerContent(session, dateStr) | Full session detail HTML |

### Prescription & Program
| Line | Function | Purpose |
|------|----------|---------|
| 3876 | renderPrescriptionCard(prescription) | Renders full prescription in #prog-today-card. Handles push/pull/legs (lift table + accessories) and run/cycling (mainSet/pace/HR). Shows reasoning, warmup, cooldown, coachNote, ifTooHard, watchOutFor. |
| 3920 | renderWeekSuggestions(weekPlan) | Renders 7-day confidence grid in #week-suggestions. Shows date/dow + suggestion + confidence badge (HIGH/MED/LOW) + reason. Reads weekPlan from last prescription. |
| 2700 | detectBlockWeek() | Block week 1-4, resets on <3 sessions in 14 days |
| 2733 | getBlockParams(blockWeek) | Sets/reps/targetRPE per block week |
| 2738 | buildPredictions(currentE1RM, slope) | 4-week e1RM projections |
| 2749 | predictLift(liftKey, blockWeek) | Predicted e1RM for a lift |
| 2776 | getAccessoryVariation(liftKey) | Accessory exercise variation string |
| 1786 | renderSystemLog() | System activity feed — merges runPrescriptions + dailyPrescriptions for display |
| 1950 | renderRulesTab() | RULES tab render with live hard rule status |

### Run Metrics
| Line | Function | Purpose |
|------|----------|---------|
| 2785 | getRestingHR() | Latest RHR from healthLogs |
| 2791 | estimateVO2max(run) | VO2max estimate from single run w/ HR. Requires run.heartRateAvg + distanceMi≥2. Returns null if called with no arg. |
| 2818 | vdotPredict(vo2max) | VDOT pace predictions |
| 2842 | riegelPredict(runs) | Riegel race prediction |
| 2867 | hrRegressionPredict(runs) | HR regression pace prediction |
| 2900 | calcRacePredictions() | Full race prediction calculation |
| 3006 | secsToRaceTime(s) | Format seconds as race time |
| 3015 | secsToPace(totalSecs, miles) | Format seconds as pace |
| 3023 | renderRacePredictions() | Render race prediction cards |
| 3103 | setRacePredChart(dist) | Set active race pred chart distance |
| 3112 | renderRacePredChart(dist) | Render race prediction chart |
| 3306 | calcRunMetrics() | Compute run metrics from D.runs |
| 3325 | renderRunMetricsSummary() | Render run metrics summary |
| 3348 | renderRunChart(type) | Render run chart (pace/HR/distance) |
| 3397 | setRunChart(type) | Set active run chart type |

### Body Metrics
| Line | Function | Purpose |
|------|----------|---------|
| 4361 | formatSleepInput(input) | Format sleep input string |
| 4372 | parseSleepHHMM(str) | Parse HH:MM sleep string to hours |
| 4380 | updateBodyCalcs() | Update BMI + body calc display |
| 4394 | renderBodyChart(type) | Render body metrics chart |
| 4438 | setBodyChart(type) | Set active body chart type |

### Utilities
| Line | Function | Purpose |
|------|----------|---------|
| 2681 | calcE1RM(weight, reps) | Epley e1RM formula, rounded to 2.5lb |
| 2683 | getLiftHistory(liftKey, daysBack=60) | Filter sessions, compute e1RM with recency weights |
| 2784 | localDS(d) | Date → YYYY-MM-DD string in local timezone |
| 2110 | updProgressStats() | Update progress tab stats |
| 3954 | renderPredictionChart(lift) | e1RM prediction chart |
| 3991 | setChartLift(lift) | Set active lift for prediction chart |
| 2356 | spin(id) | Spinner toggle helper |

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

## What Has Been Removed
- var DP, DAYS, DT, DC objects (dead vars — deleted)
- var weekNavOffset (dead — week nav system removed)
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
