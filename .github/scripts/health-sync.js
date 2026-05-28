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

function getMetricForDate(metrics, name, targetDate) {
  const m = metrics.find(x => x.name === name);
  if (!m || !m.data || m.data.length === 0) return null;
  // Prefer entry matching target date, fall back to first entry
  const match = m.data.find(d => (d.date || '').startsWith(targetDate));
  return match || m.data[0];
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

  let entry;

  if (isHAE) {
    console.log('Detected HAE format');
    const metrics = payload.data.metrics;
    // Extract date from first metric's data array, fall back to today
    let date = payload.date || null;
    if (!date) {
      const firstMetric = metrics.find(m => m.data && m.data.length > 0);
      if (firstMetric) {
        const rawDate = firstMetric.data[0].date || '';
        const dateMatch = rawDate.match(/(\d{4}-\d{2}-\d{2})/);
        if (dateMatch) date = dateMatch[1];
      }
    }
    if (!date) date = localDateStr(new Date());

    // Sleep
    const sleepEntry = getMetric(metrics, 'sleep_analysis');
    const sleepHoursRaw = sleepEntry ? (sleepEntry.totalSleep || sleepEntry.asleep || null) : null;
    const sleepHours = sleepHoursRaw !== null
      ? Math.min(Math.round(sleepHoursRaw * 10) / 10, 14)
      : null;
    const sleepDeep = sleepEntry ? (sleepEntry.deep || null) : null;
    const sleepREM = sleepEntry ? (sleepEntry.rem || null) : null;
    const sleepLight = sleepEntry ? (sleepEntry.core || null) : null;
    const sleepAwake = sleepEntry
      ? (sleepEntry.inBed && sleepHoursRaw ? Math.max(0, Math.round((sleepEntry.inBed - sleepHoursRaw) * 10) / 10) : null)
      : null;

    // Wrist temp: match target date, then convert °F → delta °C
    const wristTempRaw = getQtyForDate(metrics, 'apple_sleeping_wrist_temperature', date);
    const wristTemp = wristTempRaw !== null
      ? Math.round((wristTempRaw - 98.6) * (5 / 9) * 100) / 100
      : null;

    // Steps: round to integer (HAE sends raw float from merged sources)
    const stepsRaw = getQty(metrics, 'step_count');
    const steps = stepsRaw !== null ? Math.round(stepsRaw) : null;

    // Walking HR: round to integer
    const walkingHRRaw = getQty(metrics, 'walking_heart_rate_average');
    const walkingHR = walkingHRRaw !== null ? Math.round(walkingHRRaw) : null;

    entry = {
      date,
      restingHR: getQty(metrics, 'resting_heart_rate'),
      hrv: getQty(metrics, 'heart_rate_variability_sdnn') ?? getQty(metrics, 'heart_rate_variability'),
      wristTemp,
      sleepHours,
      sleepDeep,
      sleepREM,
      sleepLight,
      sleepAwake,
      steps,
      exerciseMinutes: getQty(metrics, 'apple_exercise_time'),
      walkingHR,
      respiratoryRate: getQty(metrics, 'respiratory_rate'),
      vo2maxApple: getQty(metrics, 'vo2_max'),
      source: 'apple_health'
    };

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

    entry = {
      date,
      restingHR: extractSimpleNumber(raw, 'restingHR'),
      hrv: extractSimpleNumber(raw, 'hrv'),
      wristTemp,
      sleepHours,
      sleepDeep: null,
      sleepREM: null,
      sleepLight: null,
      sleepAwake: null,
      steps: Math.round(extractSimpleNumber(raw, 'steps') ?? 0) || null,
      exerciseMinutes: extractSimpleNumber(raw, 'exerciseMinutes'),
      walkingHR: Math.round(extractSimpleNumber(raw, 'walkingHR') ?? 0) || null,
      respiratoryRate: extractSimpleNumber(raw, 'respiratoryRate'),
      vo2maxApple: extractSimpleNumber(raw, 'vo2max'),
      source: 'apple_health'
    };
  }

  console.log('Extracted entry:', JSON.stringify(entry));

  const dataPath = './data.json';
  let data = {};
  try {
    data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  } catch (e) {
    console.log('Starting fresh');
  }

  if (!data.healthLogs) data.healthLogs = [];

  const existingIdx = data.healthLogs.findIndex(h => h.date === entry.date);
  if (existingIdx >= 0) {
    data.healthLogs[existingIdx] = entry;
    console.log(`Updated health log for ${entry.date}`);
  } else {
    data.healthLogs.push(entry);
    console.log(`Added health log for ${entry.date}`);
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
