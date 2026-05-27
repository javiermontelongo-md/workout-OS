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

## Key data.json fields
`sessions[]` · `runs[]` · `checkins[]` · `healthLogs[]` · 
`healthLastSync` · `stravaLastSync` · `adaptivePlanCache` · 
`runPrescriptions{}` · `scheduleOverrides{}` · `coachingLog[]` · 
`bodyMetrics[]`

## Lift Keys (all 6 must exist in adaptivePlanCache.lifts)
`bench` · `ohp` · `pullup` · `row` · `squat` · `dl`

---

## Function Index
All line numbers are from origin/main. Verify before editing:
  git show origin/main:index.html | grep -n "function functionName"

### Config & Data
| Line | Function | Purpose |
|------|----------|---------|
| 1729 | lCFG() | Load config from localStorage |
| 1733 | sCFG() | Save config to localStorage |
| 1739 | fetchData() | GET data.json from GitHub API |
| 1768 | push(btnId, msgId) | PUT data.json to GitHub API |
| 1792 | defD() | Default data structure — all data.json fields |
| 3794 | pushSilent() | Silent PUT data.json — no UI feedback |

### Boot & Navigation
| Line | Function | Purpose |
|------|----------|---------|
| 1811 | hOv() | Hover handlers |
| 1813 | onLoad() | App boot — fetches data, renders tabs |
| 2014 | showTab(n) | Single nav function — all tab switching goes here |
| 2023 | renderTab(n) | Renders content for a given tab |
| 2033 | sync(state, label) | Sync status indicator |
| 2039 | msg(id, html) | Inline message renderer |

### Settings & Config UI
| Line | Function | Purpose |
|------|----------|---------|
| 2041 | modeChg() | Training mode change handler |
| 2046 | setTrainingMode(val) | Sets D.trainingMode |
| 2348 | saveCFG() | Save settings |
| 2355 | testCon() | Test GitHub connection |
| 2363 | saveAPI() | Save Anthropic API key |
| 2364 | clearAPI() | Clear API key |
| 2365 | debugAPI() | Debug API key state |
| 2392 | clrCFG() | Clear all config |
| 2391 | exportData() | Export data.json |
| 2376 | runMig() | Run data migrations |

### AI Layer
| Line | Function | Purpose |
|------|----------|---------|
| 2410 | liftTrend(key, sessions, weeks=4) | Computes 'improving'/'plateauing'/'declining'/'insufficient_data' for a lift key over N weeks |
| 2428 | buildAthleteContext() | Single shared context object for all AI calls. Returns athlete (with goals + vo2maxEstimate), hardRules, biometrics, training, checkin, schedule, body. Calls evaluateTrainingStatus() once. |
| 2604 | ai(prompt, maxTokens=800) | Shared Anthropic fetch wrapper — system prompt built from buildAthleteContext(). All AI calls route here. |
| 2635 | fai(t, id) | Renders AI text response into a DOM element |
| 2637 | genToday() | Daily coaching narrative — calls ai(1000). Returns JSON with coaching + optional scheduleNote + scheduleAdjustment. Caches result keyed on date+checkin+HRV. |
| 3518 | buildRunProfile() | Pass 1 of run prescription — sends last 80 runs to AI, returns compact profile: typicalEasyPaceMi, qualityCapacity, sub20Readiness, recommendedIntensityThisBlock, etc. Cached window._runProfileCache keyed on floor(runs.length/5). |
| 3589 | generateRunPrescription(targetDate) | Pass 2 — calls buildRunProfile() then ai(1200). AI picks easy/quality/long based on profile + biometrics. New JSON shape: recommendedType, reasoning, workout{name,warmup,mainSet,cooldown,totalDistance,paceTarget,hrCeiling,effort}, ifTooHard, watchOutFor[]. |
| 3826 | generatePostRunFeedback(targetDate) | Post-run feedback — requires D.runPrescriptions[targetDate] AND matching Strava run. Compares prescribed vs actual. Reads presc.workout with fallback to presc.primaryRecommendation for backward compat. |
| 4240 | generateAdaptivePlan() | Weekly plan — direct fetch to Anthropic (2000 tokens). Writes to window._adaptivePlan + D.adaptivePlanCache. |

### Hard Rule Engine
| Line | Function | Purpose |
|------|----------|---------|
| 3986 | evaluateTrainingStatus() | 28-rule deterministic engine. Called in buildAthleteContext(), renderRulesTab(), and renderRunPrescriptionCard(). Returns TrainingStatus: canTrain, canDoQuality, canDoHeavyLifts, liftRPECap, volumeModifier, stressScore, activeFlags, reasons, mafHR |
| 3971 | compute7DayMeans() | Rolling 7-day HRV/RHR averages with fallback to ATHLETE baselines |

### Session Logging
| Line | Function | Purpose |
|------|----------|---------|
| 2056 | chk(id) | Checkbox state helper |
| 2063 | restChk() | Rest day checkbox handler |
| 2075 | initSets() | Initialize set tracking state |
| 2076 | addSet(lift) | Add a set to a lift block |
| 2081 | removeSet(lift, i) | Remove a set from a lift block |
| 2082 | renderSets(lift) | Render set inputs for a lift |
| 2090 | saveSession() | Save session to D.sessions[], clears adaptivePlanCache |
| 2124 | resetLogForm() | Reset log form to defaults |
| 2128 | renderSessHist() | Render session history list |
| 3141 | toggleRunLogSection() | Show/hide run inputs |
| 3146 | onDayTypeChange(value) | Shows correct lift blocks per day type |
| 3185 | startLoggingSession() | Initialize log tab for today |

### Check-in
| Line | Function | Purpose |
|------|----------|---------|
| 3955 | calcFatigue(energy,sleep,soreness,motivation,stress) | Computes fatigueScore 0-10 |
| 3960 | updateFatiguePreview() | Live fatigue preview in check-in UI |
| 3972 | togglePostCall() | POST_CALL flag toggle — blocks all quality/heavy |
| 3982 | saveCheckin() | Save check-in to D.checkins[] |
| 4027 | _buildSparkRows(checkins30, larger) | Sparkline row builder for snapshot |
| 4062 | renderSnapshotCharts() | Render check-in snapshot charts |
| 4251 | initCheckinTab() | Initialize check-in tab |
| 4277 | updateTodayPreview() | Live preview of today's plan |

### Calendar & Week View
| Line | Function | Purpose |
|------|----------|---------|
| 2168 | getWeekStart(offset) | Returns week start date for offset |
| 2174 | getSessionsForDate(dateStr) | Filter sessions for a date |
| 2178 | getActivityBadges(sessions, dateStr) | Activity badge HTML for calendar |
| 2192 | getPlannedBadge(dateStr) | Planned workout badge for calendar |
| 2201 | calNav(dir) | Calendar navigation |
| 2205 | renderCalendar() | Full calendar render |
| 2251 | handleDayCardClick(dateStr) | Day card click — past→drawer, future→program, rest→no-op |
| 2265 | openSessionDrawer(session, dateStr) | Slide-in session detail drawer |
| 2288 | closeSessionDrawer() | Dismiss session drawer |
| 2297 | buildSessionDrawerContent(session, dateStr) | Full session detail HTML |
| 4484 | weekNavNav(dir) | THIS WEEK nav arrows |
| 4490 | getWeekLabel(offset) | Week label string |
| 4494 | getWeekDateRange(offset) | Week date range string |
| 4500 | getBlockPhaseForOffset(offset) | Block phase for a week offset |
| 4523 | getActualLiftsForWeek(offset) | Actual lifts logged for a week |
| 4541 | getPlannedLiftsForWeek(offset) | Planned lifts for a week |
| 4555 | renderWeekNavLifts(offset) | Lift display in THIS WEEK panel |
| 4608 | renderWeekNav() | Full THIS WEEK panel render |

### Schedule System
| Line | Function | Purpose |
|------|----------|---------|
| 3434 | buildSchedule() | Generates window._schedule — 28-day array respecting scheduleOverrides |
| 3458 | applyScheduleOverride(date, dayType) | Swap model ripple: captures displaced workout, finds next DOW slot for selected type, places displaced there, writes selected type to today + LIFT_SPACING |
| 3497 | confirmDayOverride() | UI handler for week-day-override dropdown |
| 3522 | buildLocalPlan() | Hydrates window._adaptivePlan from D.adaptivePlanCache |
| 2343 | ldPrev() | Load previous week |

### Program & Plan
| Line | Function | Purpose |
|------|----------|---------|
| 2443 | detectBlockWeek() | Block week 1-4, resets on <3 sessions in 14 days |
| 2476 | getBlockParams(blockWeek) | Sets/reps/targetRPE per block week |
| 2481 | buildPredictions(currentE1RM, slope) | 4-week e1RM projections |
| 2492 | predictLift(liftKey, blockWeek) | Predicted e1RM for a lift |
| 2519 | getAccessoryVariation(liftKey) | Accessory exercise variation string |
| 4086 | buildPlanContext() | Assembles context object for generateAdaptivePlan |
| 4128 | buildPlanPrompt(ctx) | Builds AI prompt for weekly plan |
| — | parsePlanResponse(response) | Validates + parses AI plan JSON. Rejects if any of 6 lift keys missing. |
| — | renderAdaptivePlan() | Renders plan in THIS WEEK tab |
| — | confirmRPE(lift, actualRPE) | RPE confirmation after session |
| — | showRPEConfirm(lift) | RPE confirmation UI |
| — | getTodayDayType() | Returns today's day type from schedule |
| — | buildPrescriptionString(lift) | Prescription string for a lift |
| — | getDayProgram(dayType) | Program details for a day type — 'run' branch shows live presc if available |
| — | renderDayCard(dayType, isToday, isExpanded) | Program day card HTML |
| — | toggleProgDay(el, dayType) | Toggle program day expansion |
| — | renderProgramTab() | Full PROGRAM tab render |
| 1825 | renderSystemLog() | System activity feed — reads recommendedType + workout.totalDistance for run prescriptions |
| 1985 | renderRulesTab() | RULES tab render with live hard rule status |

### Run Metrics & Prescription
| Line | Function | Purpose |
|------|----------|---------|
| — | getRestingHR() | Latest RHR from healthLogs |
| — | estimateVO2max(run) | VO2max estimate from single run w/ HR. Requires run.heartRateAvg + distance≥2. Returns null if called with no arg. |
| — | vdotPredict(vo2max) | VDOT pace predictions |
| — | riegelPredict(runs) | Riegel race prediction |
| — | hrRegressionPredict(runs) | HR regression pace prediction |
| — | calcRacePredictions() | Full race prediction calculation |
| — | secsToRaceTime(s) | Format seconds as race time |
| — | secsToPace(totalSecs, miles) | Format seconds as pace |
| — | renderRacePredictions() | Render race prediction cards |
| — | setRacePredChart(dist) | Set active race pred chart distance |
| — | renderRacePredChart(dist) | Render race prediction chart |
| — | calcRunMetrics() | Compute run metrics from D.runs |
| — | renderRunMetricsSummary() | Render run metrics summary |
| — | renderRunChart(type) | Render run chart (pace/HR/distance) |
| — | setRunChart(type) | Set active run chart type |
| 3518 | buildRunProfile() | See AI Layer above |
| 3589 | generateRunPrescription(targetDate) | See AI Layer above |
| 3726 | renderRunPrescriptionCard(targetDate) | Reads D.runPrescriptions[targetDate] directly. No runDayMap. No plan.runs dependency. Calls evaluateTrainingStatus() for hard rule flags. |
| 3819 | markRunComplete(targetDate) | Mark run complete + trigger post-run feedback |

### Body Metrics
| Line | Function | Purpose |
|------|----------|---------|
| 4632 | formatSleepInput(input) | Format sleep input string |
| 4643 | parseSleepHHMM(str) | Parse HH:MM sleep string to hours |
| 4651 | updateBodyCalcs() | Update BMI + body calc display |
| 4665 | renderBodyChart(type) | Render body metrics chart |
| 4709 | setBodyChart(type) | Set active body chart type |

### Utilities
| Line | Function | Purpose |
|------|----------|---------|
| 2424 | calcE1RM(weight, reps) | Epley e1RM formula, rounded to 2.5lb |
| 2426 | getLiftHistory(liftKey, daysBack=60) | Filter sessions, compute e1RM with recency weights |
| 2527 | localDS(d) | Date → YYYY-MM-DD string in local timezone |
| 2145 | updProgressStats() | Update progress tab stats |
| 3891 | renderPredictionChart(lift) | e1RM prediction chart |
| 3928 | setChartLift(lift) | Set active lift for prediction chart |
| 3934 | updateLogTabPlanned() | Update log tab with today's planned workout |
| 2397 | spin(id) | Spinner toggle helper |

---

## AI Architecture (post-refactor)

### Call Hierarchy
```
buildAthleteContext()  ← called once per AI invocation
  └── evaluateTrainingStatus()  ← hard rules, single call
  └── compute7DayMeans()        ← biometrics
  └── detectBlockWeek()         ← block state (cached in const)
      └── getBlockParams()
  └── estimateVO2max(_bestHRRun)  ← IIFE — finds latest run w/ HR + dist≥2

ai(prompt, maxTokens=800)  ← shared fetch wrapper
  └── buildAthleteContext()  ← system prompt built here
  └── called by:
      ├── genToday()                    (1000 tokens)
      ├── buildRunProfile()             (1500 tokens) — Pass 1
      ├── generateRunPrescription()     (1200 tokens) — Pass 2
      └── generatePostRunFeedback()     (800 tokens)

generateAdaptivePlan()  ← direct fetch, bypasses ai()
  └── buildPlanContext()   ← separate context builder
  └── buildPlanPrompt()    ← separate prompt builder

generateRunPrescription(targetDate)  ← two-pass
  └── buildRunProfile()    ← Pass 1: full history profile (cached)
  └── buildAthleteContext()  ← Pass 2: live biometrics + hard rules
  └── ai(prompt, 1200)
```

### evaluateTrainingStatus() Call Sites (3)
1. buildAthleteContext() — feeds all ai() calls
2. renderRulesTab() — live status display in RULES tab
3. renderRunPrescriptionCard() — hard rule flag display in card

### _runProfileCache
Stored in: window._runProfileCache = { key: floor(runs.length/5), profile }
Invalidated: automatically after every 5 new runs logged
Fields: currentFitnessLevel, typicalEasyPaceMi, typicalEasyPaceKm,
        bestRecentPace, qualityCapacity, volumeTrend, hrTrend,
        consistencyPattern, watchPatterns, sub20Readiness,
        recommendedIntensityThisBlock, profileSummary

### coachingLog Write Sites (5)
All use identical pattern: push → slice(-50) → renderSystemLog()
- genToday() → type: 'today_coaching'
- buildRunProfile() → type: 'run_profile'
- generateRunPrescription() → type: 'run_prescription'
- generatePostRunFeedback() → type: 'post_run'
- generateAdaptivePlan() → type: 'week_plan'

### genToday() Cache
Keyed on: `${date}|${energy}|${sleep}|${hrv}`
Stored in: window._genTodayCache = { key, response }
Invalidated: automatically on next day or checkin change

### Schedule Note System
genToday() returns JSON with optional fields:
- scheduleNote: plain string shown in #week-schedule-note banner
- scheduleAdjustment: {date: dayType} written to scheduleOverrides
  Only dates within next 14 days accepted. Max 14-day horizon.

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

## Schedule Constants
```
LIFT_SPACING:  {A:7, B:7, C:7, run:5}
dowToDayType:  {0:null, 1:'A', 2:'run', 3:'B', 4:'run', 5:'C', 6:'run'}
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
- var DP object (deleted — dead code with numeric keys)
- Hardcoded cardio struct in saveSession()
- Legacy pullups:{sets,reps} aggregate in saveSession()
- pu-sets and pu-reps input elements
- plan-debug console.log lines
- Old BIOMETRIC RULES hardcoded prose in buildPlanPrompt()
- Hardcoded "Kaiser SF" string in ai() system prompt
  (now lives in buildAthleteContext().athlete.location)
- Duplicate evaluateTrainingStatus() calls in genToday()
  and buildPlanPrompt() (now single call in buildAthleteContext())
- Dead top-level statements after genToday() closing brace
  (coachingLog.push, pushSilent, renderSystemLog were
  executing at page load — moved inside function body)
- runDayMap {run_easy:'tuesday',...} — removed from renderRunPrescriptionCard()
  (card now reads D.runPrescriptions[targetDate] directly)
- Old run prescription JSON shape: primaryRecommendation{distance,pace,hrCap,effort,notes}
  (replaced with: recommendedType, reasoning, workout{...}, ifTooHard, watchOutFor[])
- Schedule types run_easy / run_quality / run_long consolidated to single 'run'
  (AI prescribes intensity via generateRunPrescription two-pass flow)
- User-selected run type dropdown (run_easy/quality/long) — AI decides now
- estimateVO2max() called with no arg in buildAthleteContext (always returned null)
  (fixed: IIFE finds most recent run with heartRateAvg + distanceMi≥2)
