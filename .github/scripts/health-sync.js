const fs = require('fs');

function localDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getMetric(metrics, name) {
  const m = metrics.find(x => x.name === name);
  if (!m || !m.data || m.data.length === 0) return null;
  return m.data[0];
}

// Strict date match — no fallback to data[0].
// Avoids cross-date contamination when a payload covers multiple days.
function getMetricForDate(metrics, name, targetDate) {
  const m = metrics.find(x => x.name === name);
  if (!m || !m.data || m.data.length === 0) return null;
  const match = m.data.find(d => (d.date || '').startsWith(targetDate));
  return match || null;
}

function getQty(metrics, name) {
  const entry = getMetric(metrics, name);
  if (!entry || entry.qty === undefined || entry.qty === null) return null;
  const val = parseFloat(entry.qty);
  return isNaN(val) ? null : val;
}

function getQtyForDate(metrics, name, targetDate) {
  const entry = getMetricForDate(metrics, name, targetDate);
  if (!entry || entry.qty === undefined || entry.qty === null) return null;
  const val = parseFloat(entry.qty);
  return isNaN(val) ? null : val;
}

// Sum all qty values for a metric on a given date.
// Handles both summarized payloads (single entry = daily total already) and
// unsummarized payloads (many per-minute entries, e.g. step_count from "Today").
function getSumQtyForDate(metrics, name, targetDate) {
  const m = metrics.find(x => x.name === name);
  if (!m || !m.data || m.data.length === 0) return null;
  const entries = m.data.filter(d => (d.date || '').startsWith(targetDate));
  if (entries.length === 0) return null;
  const sum = entries.reduce((acc, e) => {
    const v = parseFloat(e.qty);
    return acc + (isNaN(v) ? 0 : v);
  }, 0);
  return sum > 0 ? sum : null;
}

// Extract all distinct calendar dates (YYYY-MM-DD) found across all metrics.
// Works for single-day ("Since Last Sync") and multi-day ("Last N Days") payloads.
function getAllDates(metrics) {
  const dateSet = new Set();
  for (const metric of metrics) {
    if (!metric.data) continue;
    for (const entry of metric.data) {
      const raw = entry.date || entry.inBedStart || '';
      const m = raw.match(/(\d{4}-\d{2}-\d{2})/);
      if (m) dateSet.add(m[1]);
    }
  }
  return Array.from(dateSet).sort();
}

// Build one day's health log entry from the full metrics array.
// Each metric lookup is scoped to targetDate, so this works correctly
// whether the payload has 1 day or 7 days worth of data.
function buildEntryForDate(metrics, date) {
  // Sleep — HAE files sleep under the session START date (the night you went
  // to bed), not the wake-up date. So sleep ending morning of May 29 is
  // dated May 28, and will be found when processing the May 28 entry.
  const sleepEntry = getMetricForDate(metrics, 'sleep_analysis', date);
  const sleepHoursRaw = sleepEntry ? (sleepEntry.totalSleep || sleepEntry.asleep || null) : null;
  const sleepHours = sleepHoursRaw !== null
    ? Math.min(Math.round(sleepHoursRaw * 10) / 10, 14)
    : null;
  const sleepDeep  = sleepEntry ? (sleepEntry.deep || null) : null;
  const sleepREM   = sleepEntry ? (sleepEntry.rem  || null) : null;
  const sleepLight = sleepEntry ? (sleepEntry.core || null) : null;
  const sleepAwakeRaw = sleepEntry ? (sleepEntry.awake || null) : null;
  const sleepAwake = sleepAwakeRaw !== null
    ? Math.round(sleepAwakeRaw * 10) / 10
    : null;

  // Sleep timing — HAE sends sleepStart / sleepEnd (ISO strings) on sleep_analysis entries.
  // Store as "HH:MM" local time. Midpoint stored as decimal hours past midnight (handles
  // cross-midnight correctly: if wake < onset, add 24 before averaging).
  function isoToHHMM(isoStr) {
    if (!isoStr) return null;
    // Format: "2026-05-19 01:23:00 -0400" or "2026-05-19T01:23:00-04:00"
    const m = isoStr.replace('T', ' ').match(/(\d{2}):(\d{2}):\d{2}\s[+-]/);
    if (!m) return null;
    return `${m[1]}:${m[2]}`;
  }
  function hhmmToDecimal(hhmm) {
    if (!hhmm) return null;
    const [h, m] = hhmm.split(':').map(Number);
    return h + m / 60;
  }
  const sleepOnset = sleepEntry ? isoToHHMM(sleepEntry.sleepStart || sleepEntry.inBedStart) : null;
  const wakeTime   = sleepEntry ? isoToHHMM(sleepEntry.sleepEnd   || sleepEntry.inBedEnd)   : null;
  let sleepMidpoint = null;
  if (sleepOnset && wakeTime) {
    const onsetH = hhmmToDecimal(sleepOnset);
    const wakeH  = hhmmToDecimal(wakeTime);
    // If wake < onset the session crossed midnight — add 24 to wake before averaging
    const adjustedWake = wakeH < onsetH ? wakeH + 24 : wakeH;
    sleepMidpoint = Math.round(((onsetH + adjustedWake) / 2) * 100) / 100;
    if (sleepMidpoint >= 24) sleepMidpoint -= 24; // normalise back to 0–24
  }

  // Wrist temp: convert °F → delta °C
  const wristTempRaw = getQtyForDate(metrics, 'apple_sleeping_wrist_temperature', date);
  const wristTemp = wristTempRaw !== null
    ? Math.round((wristTempRaw - 98.6) * (5 / 9) * 100) / 100
    : null;

  // Steps: SUM all entries for this date.
  // With Summarize Data ON + completed day → single entry, sum = that value.
  // With in-progress "Today" sync → many per-minute entries, sum = running total.
  const stepsRaw = getSumQtyForDate(metrics, 'step_count', date);
  const steps = stepsRaw !== null ? Math.round(stepsRaw) : null;

  // Exercise minutes: also accumulates; sum handles both cases
  const exerciseRaw = getSumQtyForDate(metrics, 'apple_exercise_time', date);
  const exerciseMinutes = exerciseRaw !== null ? Math.round(exerciseRaw) : null;

  // Active calories (active_energy): accumulates like steps
  const activeCalRaw = getSumQtyForDate(metrics, 'active_energy', date);
  const activeCalories = activeCalRaw !== null ? Math.round(activeCalRaw) : null;

  // Walking HR: daily average, single-point metric
  const walkingHRRaw = getQtyForDate(metrics, 'walking_heart_rate_average', date);
  const walkingHR = walkingHRRaw !== null ? Math.round(walkingHRRaw) : null;

  // Walking speed: daily average in mi/hr, single-point metric
  const walkingSpeedRaw = getQtyForDate(metrics, 'walking_speed', date);
  const walkingSpeed = walkingSpeedRaw !== null ? Math.round(walkingSpeedRaw * 100) / 100 : null;

  return {
    date,
    restingHR:     getQtyForDate(metrics, 'resting_heart_rate', date),
    hrv:           getQtyForDate(metrics, 'heart_rate_variability_sdnn', date)
                   ?? getQtyForDate(metrics, 'heart_rate_variability', date),
    wristTemp,
    sleepHours,
    sleepDeep,
    sleepREM,
    sleepLight,
    sleepAwake,
    sleepOnset,
    wakeTime,
    sleepMidpoint,
    steps,
    exerciseMinutes,
    activeCalories,
    walkingHR,
    walkingSpeed,
    respiratoryRate: getQtyForDate(metrics, 'respiratory_rate', date),
    vo2maxApple:   getQtyForDate(metrics, 'vo2_max', date),
    source: 'apple_health'
  };
}

async function main() {
  const healthDataRaw = process.env.HEALTH_DATA;
  if (!healthDataRaw) {
    console.log('No health data provided');
    process.exit(0);
  }

  console.log('Raw data preview:', healthDataRaw.substring(0, 500));

  let payload;
  try {
    payload = JSON.parse(healthDataRaw);
  } catch (e) {
    console.error('Failed to parse HEALTH_DATA as JSON:', e.message);
    process.exit(1);
  }

  // Support both HAE format { data: { metrics: [...] } } and legacy flat object
  const isHAE = payload && payload.data && Array.isArray(payload.data.metrics);

  const entries = [];

  if (isHAE) {
    console.log('Detected HAE format');
    const metrics = payload.data.metrics;

    // Discover all distinct dates in the payload.
    // Single-day payloads ("Since Last Sync") produce one date.
    // Multi-day payloads ("Last 2 Days", "Last 7 Days") produce multiple dates.
    let dates = getAllDates(metrics);
    if (dates.length === 0) {
      dates = [payload.date || localDateStr(new Date())];
    }
    console.log(`Dates in payload: ${dates.join(', ')}`);

    for (const date of dates) {
      const entry = buildEntryForDate(metrics, date);

      // Skip dates that had absolutely no data in the payload
      const hasAnyData = Object.entries(entry)
        .filter(([k]) => k !== 'date' && k !== 'source')
        .some(([, v]) => v !== null && v !== undefined);

      if (!hasAnyData) {
        console.log(`Skipping ${date} — all metrics null for this date`);
        continue;
      }

      console.log(`Extracted entry for ${date}:`, JSON.stringify(entry));
      entries.push(entry);
    }

  } else {
    // Legacy Shortcut flat format — keep old regex parser as fallback
    console.log('Detected legacy Shortcut format');
    const raw = healthDataRaw;

    function extractSimpleNumber(str, key) {
      const re = new RegExp(`"+${key}"+\s*:\s*([\d.]+)`, 'i');
      const match = str.match(re);
      if (match) {
        const val = parseFloat(match[1]);
        return isNaN(val) ? null : val;
      }
      return null;
    }

    const dateMatch = raw.match(/"*date"*\s*:\s*"(\d{4}-\d{2}-\d{2})/);
    const date = dateMatch ? dateMatch[1] : localDateStr(new Date());

    const sleepMatch = raw.match(/"*sleepHours"*\s*:\s*([\d.]+)/i);
    let sleepHours = null;
    if (sleepMatch) {
      const seconds = parseFloat(sleepMatch[1]);
      if (!isNaN(seconds) && seconds > 0) {
        sleepHours = Math.min(Math.round((seconds / 3600) * 10) / 10, 14);
        if (sleepHours < 1) sleepHours = null;
      }
    }

    const wristTempRaw = extractSimpleNumber(raw, 'wristTemp');
    const wristTemp = wristTempRaw !== null
      ? Math.round((wristTempRaw - 98.6) * (5 / 9) * 100) / 100
      : null;

    entries.push({
      date,
      restingHR:     extractSimpleNumber(raw, 'restingHR'),
      hrv:           extractSimpleNumber(raw, 'hrv'),
      wristTemp,
      sleepHours,
      sleepDeep:     null,
      sleepREM:      null,
      sleepLight:    null,
      sleepAwake:    null,
      steps:         Math.round(extractSimpleNumber(raw, 'steps') ?? 0) || null,
      exerciseMinutes: extractSimpleNumber(raw, 'exerciseMinutes'),
      activeCalories: Math.round(extractSimpleNumber(raw, 'activeCalories') ?? 0) || null,
      walkingHR:     Math.round(extractSimpleNumber(raw, 'walkingHR') ?? 0) || null,
      walkingSpeed:  extractSimpleNumber(raw, 'walkingSpeed'),
      respiratoryRate: extractSimpleNumber(raw, 'respiratoryRate'),
      vo2maxApple:   extractSimpleNumber(raw, 'vo2max'),
      source: 'apple_health'
    });
  }

  if (entries.length === 0) {
    console.log('No entries to upsert — nothing changed');
    process.exit(0);
  }

  const dataPath = './data.json';
  let data = {};
  try {
    data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  } catch (e) {
    console.log('Starting fresh');
  }

  if (!data.healthLogs) data.healthLogs = [];

  for (const entry of entries) {
    const existingIdx = data.healthLogs.findIndex(h => h.date === entry.date);
    if (existingIdx >= 0) {
      // Merge: never wipe a field that was already recorded just because this
      // sync doesn't have it (e.g. morning sleep sync followed by evening
      // activity sync — both cover the same date with different non-null fields).
      const existing = data.healthLogs[existingIdx];
      const merged = { ...existing };
      for (const [key, val] of Object.entries(entry)) {
        if (val !== null && val !== undefined) {
          merged[key] = val;
        }
      }
      data.healthLogs[existingIdx] = merged;
      console.log(`Merged health log for ${entry.date}`);
    } else {
      data.healthLogs.push(entry);
      console.log(`Added health log for ${entry.date}`);
    }
  }

  data.healthLogs.sort((a, b) => a.date.localeCompare(b.date));
  data.healthLastSync = new Date().toISOString();

  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  console.log(`Done. Total health logs: ${data.healthLogs.length}`);
}

main().catch(err => {
  console.error('Health sync failed:', err);
  process.exit(1);
});
