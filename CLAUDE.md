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
TODAY · LOG SESSION · THIS WEEK · PROGRESS · PROGRAM · MILESTONES · SETTINGS

## Key data.json fields
`sessions[]` · `runs[]` · `checkins[]` · `healthLogs[]` · 
`healthLastSync` · `stravaLastSync` · `adaptivePlanCache` · 
`runPrescriptions{}` · `scheduleOverrides{}` · `coachingLog[]` · 
`bodyMetrics[]`

## Lift Keys (all 6 must exist in adaptivePlanCache.lifts)
`bench` · `ohp` · `pullup` · `row` · `squat` · `dl`

## What's Confirmed in Canonical index.html
Verified against origin/main. All features below are present
and confirmed with grep counts.

### Core Architecture
- showTab() single nav function
- pushSilent() saves data.json to GitHub
- localDS() date formatting
- defD() default data structure

### PPL Program Structure
- Push/Pull/Legs day types (A/B/C)
- PPL labels in both #today-day and #log-day selects
- onDayTypeChange() shows correct blocks per day type
- bench-block, ohp-block (Push)
- pullup-block, row-block (Pull) — full set tracking
- squat-block, deadlift-block (Legs)

### AI Plan System
- generateAdaptivePlan() — manual trigger only
- parsePlanResponse() — validates all 6 lift keys including pullup + row
- buildPlanContext() — sends pullup/row history to AI
- buildPlanPrompt() — PPL program description + accessories
- renderWeekNavLifts() — displays all 6 lifts (bench/ohp/pullup/row/squat/dl)
- TRAINING MODE RULES enforced numerically in prompt

### Lift Tracking (all 6)
- getLift('pullup') and getLift('row') in saveSession()
- pullupE1RM and rowE1RM in defD() and saveSession()
- benchE1RM, ohpE1RM, squatE1RM, deadliftE1RM also present

### Session Logging
- cardioObj — conditional write, only on run days with data
- Run inputs wired: run-distance, run-duration, run-hr, run-rpe, run-notes
- saveSession() reads all 6 lifts + conditional cardio

### Schedule System
- buildSchedule() — sets window._schedule and returns array
- scheduleOverrides in defD()
- applyScheduleOverride() — ripple logic
- confirmDayOverride() — UI handler
- week-day-override dropdown in THIS WEEK tab
- wasShifted flag on schedule entries
- detectBlockWeek() — resets on low training density

### THIS WEEK Tab
- renderCalendar() — grid.onclick delegated listener
- handleDayCardClick() — routes to drawer or program tab
- getPlannedBadge() — PPL labels
- Override dot indicator on overridden days

### Session Detail Drawer
- openSessionDrawer() — slide-in from right
- closeSessionDrawer() — animated dismiss
- buildSessionDrawerContent() — full session detail
- Handles both old (pullups integer) and new (set array) data shapes
- Cardio section only shows when dur > 0 or dist > 0

### Infrastructure
- no-store cache meta tags in <head>
- CLAUDE.md canonical verification rules
- git pull --rebase && git push after every commit
- All greps run against origin/main via git show

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
- var DP object (deleted)
- Hardcoded cardio struct in saveSession()
- Legacy pullups:{sets,reps} aggregate
- pu-sets and pu-reps inputs
- plan-debug console.log lines
- deadlift-block renamed back — HTML uses deadlift-block, JS matches
