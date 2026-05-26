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

## What's Confirmed in Canonical index.html
Verified against origin/main via git show. All features 
below are confirmed present.

### Core Architecture
- showTab() single nav function
- pushSilent() saves data.json to GitHub (data.json only)
- localDS() date formatting
- defD() default data structure including scheduleOverrides{}
- ATHLETE constants object:
  age 28, weight 225lb, height 70in, waist 37in,
  HRV baseline 53.5ms, RHR baseline 57.2bpm,
  MAF HR 147bpm (180 − 28 − 5),
  sleep baseline 7.1h from 95 days Apple Watch data
- compute7DayMeans() — rolling 7-day HRV/RHR averages
  with fallback to ATHLETE baselines when data sparse
- evaluateTrainingStatus() — 28-rule deterministic hard 
  rule engine, runs before every AI call, returns 
  TrainingStatus object with canTrain, canDoQuality,
  canDoHeavyLifts, liftRPECap, volumeModifier, 
  stressScore, activeFlags, reasons, mafHR
- no-store cache meta tags in head (no browser caching)

### PPL Program Structure
- Push/Pull/Legs day types (A/B/C)
- PPL labels in #today-day, #log-day, #week-day-override
- onDayTypeChange() shows correct blocks per day:
  Push (A): bench-block + ohp-block
  Pull (B): pullup-block + row-block
  Legs (C): squat-block + deadlift-block
  Run days: run-log-section only

### AI Plan System
- generateAdaptivePlan() — manual trigger only
- parsePlanResponse() — validates all 6 lift keys 
  including pullup + row (rejects if missing)
- buildPlanContext() — sends pullup/row history to AI
- buildPlanPrompt() — receives evaluateTrainingStatus() 
  output, passes TrainingStatus to AI instead of raw 
  biometric prose. Old hardcoded BIOMETRIC RULES block 
  replaced with computed hard rule engine output.
- renderWeekNavLifts() — displays all 6 lifts 
  (bench/ohp/pullup/row/squat/dl) in THIS WEEK panel
- TRAINING MODE RULES enforced numerically in prompt
- Auto-correct: plan rejected if pullup or row missing

### Lift Tracking (all 6)
- getLift('pullup') and getLift('row') in saveSession()
- pullupE1RM:0 and rowE1RM:135 in defD() and saveSession()
- benchE1RM, ohpE1RM, squatE1RM, deadliftE1RM also present
- e1RM formula: weight * (1 + reps/30)
- liftBests tracks all 6 lifts for AI context

### Session Logging
- cardioObj — conditional write, only on run days with data
- Run inputs wired: run-distance, run-duration, run-hr, 
  run-rpe, run-notes all read in saveSession()
- Auto-calculated pace from distance + duration
- saveSession() reads all 6 lifts + conditional cardio
- No hardcoded cardio struct — clean conditional only

### Daily Check-in
- ci-energy slider (1-10)
- ci-sleep-input (HH:MM format)
- ci-postcall-btn — post-call toggle (No/Yes)
  Hard block: POST_CALL flag blocks all quality and 
  heavy training regardless of other biometrics
- postCall field saved in every checkin entry
- fatigueScore, soreness, motivation, stress also saved

### Hard Rule Engine (evaluateTrainingStatus)
28 Category A rules — deterministic, never AI-dependent:
- POST_CALL → canTrain=false, volumeModifier=0
- FEVER_SIGNAL (wrist temp ≥+1.5°C) → canTrain=false
- SLEEP_BLOCK (<5h) → no quality, no heavy, RPE cap 6
- SLEEP_WARNING (5-6.5h) → volume 85%, RPE cap 7
- HRV_ACUTE_CRASH (<80% of 7d mean) → no quality/heavy,
  volume 75%, RPE cap 6
- HRV_WARNING (80-90% of 7d mean) → volume 85%, RPE cap 7
- RHR_SPIKE (>8bpm above 7d mean) → no quality, RPE cap 7
- DELOAD_WEEK (blockWeek 4) → no quality, volume 60%
- Subjective fatigue ≥8/10 → volume 85%, RPE cap 7
- All rules use min() so multiple flags stack correctly
- stressScore 0-3 composite passed to AI

### Run Prescription
- renderRunPrescriptionCard() reads from plan.runs 
  (no second AI call)
- runDayMap: run_easy→tuesday, run_quality→thursday,
  run_long→saturday
- Hard rule warnings shown inline in card
- Quality run downgraded warning when canDoQuality=false
- MAF HR ceiling (147 bpm) displayed in prescription
- Stale plan warning shown after 3 days
- Zero fetch() calls inside renderRunPrescriptionCard
- Falls back gracefully if no plan exists

### Schedule System
- buildSchedule() — sets window._schedule AND returns array
- scheduleOverrides{} in defD() and data.json
- applyScheduleOverride() — full ripple logic:
  1. Captures what was previously scheduled for today (displaced)
  2. Finds next DOW occurrence of the selected workout type
  3. Places displaced workout there (not rest — swap, not delete)
  4. Writes selected workout to today + LIFT_SPACING days
  Example: Push on Sunday → next Push-DOW gets displaced workout
- confirmDayOverride() — UI handler, syncs log + today tabs
- week-day-override dropdown in THIS WEEK tab
- wasShifted flag on schedule entries
- detectBlockWeek() — resets on <3 sessions in 14 days
- overrideDot indicator on overridden calendar cells
- LIFT_SPACING: {A:7, B:7, C:7, run_easy:3, run_quality:5, run_long:7}
- dowToDayType: {0:null,1:A,2:run_easy,3:B,4:run_quality,
  5:C,6:run_long}

### THIS WEEK Tab
- renderCalendar() — grid.onclick delegated listener
  (survives innerHTML replacement)
- handleDayCardClick() — past day with session → drawer,
  future scheduled day → program tab, rest → no-op
- getPlannedBadge() — PPL labels (Push/Pull/Legs)
- Override dot indicator on overridden days

### Session Detail Drawer
- openSessionDrawer() — slide-in from right, animated
- closeSessionDrawer() — animated dismiss, removes DOM
- buildSessionDrawerContent() — full session detail:
  header with date + day label, meta chips 
  (duration/RPE/energy/sleep/BW), lift sets with 
  weight/reps/RPE per set, legacy pullups display,
  cardio section, session notes
- Handles both old (pullups integer) and new 
  (pullup/row set arrays) data shapes gracefully
- Cardio only shown when dur>0 or dist>0
- Future day tap → showTab('program')

### RULES Tab
- panel-rules with full static content
- renderRulesTab() called from showTab('rules')
- 9 hard rules with live ✓ clear / ⚠ ACTIVE status
  using real computed thresholds from evaluateTrainingStatus
- 10 soft rules with evidence citations
- 6 AI contribution cards
- 6 user guidance cards (when to generate, log, rest etc.)
- 14-source evidence base (Maffetone, Seiler, Daniels,
  NSCA, Zourdos, Israetel/RP, Milewski, Dawson, 
  Leveritt, Schumann, Plews, Foster, Besedovsky, Blumert)

### Infrastructure
- no-store cache meta tags prevent browser caching
- CLAUDE.md canonical verification rules
- git pull --rebase && git push after every commit
- All greps run against origin/main via git show
- Never use local file grep — always git show origin/main

## Canonical Verification Rule

Never use local file grep to verify features.
Always verify against the remote canonical file directly.

To check if a feature exists in the canonical file:
  git show origin/main:index.html | grep -c "search-term"

This reads from the remote ref directly, bypassing whatever
is in the local working tree. Use this for ALL verification
grep checks, not grep on the local file.

Before reporting any feature as present or absent, run:
  git show origin/main:index.html | grep -c "feature-string"

Never run: grep -c "string" index.html
Always run: git show origin/main:index.html | grep -c "string"

## What Has Been Removed
- var DP object (deleted — was dead code with numeric keys)
- Hardcoded cardio struct in saveSession()
- Legacy pullups:{sets,reps} aggregate in saveSession()
- pu-sets and pu-reps input elements
- plan-debug console.log lines
- Old BIOMETRIC RULES hardcoded prose in buildPlanPrompt()
- generateRunPrescription() NOT removed — still exists as
  async helper called from renderRunPrescriptionCard().
  The UI button now calls renderRunPrescriptionCard() directly
  (no standalone AI call button). Function reads plan.runs
  and falls back to AI only when needed.
- deadlift-block never renamed — HTML correctly uses 
  deadlift-block, JS matches
