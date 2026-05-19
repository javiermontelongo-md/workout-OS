const fs = require('fs');

function localDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

async function main() {
  const healthDataRaw = process.env.HEALTH_DATA;
  if (!healthDataRaw) {
    console.log('No health data provided');
    process.exit(0);
  }

  let healthData;
  try {
    healthData = JSON.parse(healthDataRaw);
  } catch(e) {
    console.log('Direct parse failed, attempting cleanup:', e.message);
    try {
      let cleaned = healthDataRaw
        .replace(/:\s*\[object Object\]/g, ':null')
        .replace(/:\s*undefined/g, ':null')
        .replace(/,\s*}/g, '}')
        .replace(/,\s*,/g, ',')
        .trim();
      healthData = JSON.parse(cleaned);
      console.log('Cleaned parse succeeded');
    } catch(e2) {
      console.error('Failed to parse health data after cleanup:', e2.message);
      console.error('Raw data received:', healthDataRaw.substring(0, 500));
      process.exit(1);
    }
  }

  function extractNumber(val) {
    if (val === null || val === undefined) return null;
    if (typeof val === 'number') return val;
    if (typeof val === 'string') {
      const n = parseFloat(val);
      return isNaN(n) ? null : n;
    }
    if (typeof val === 'object') {
      return val.value ?? val.Value ?? val.quantity ?? null;
    }
    return null;
  }

  healthData = {
    date: healthData.date || new Date().toISOString().split('T')[0],
    restingHR: extractNumber(healthData.restingHR),
    hrv: extractNumber(healthData.hrv),
    wristTemp: extractNumber(healthData.wristTemp),
    sleepHours: extractNumber(healthData.sleepHours),
    steps: extractNumber(healthData.steps),
    exerciseMinutes: extractNumber(healthData.exerciseMinutes),
    walkingHR: extractNumber(healthData.walkingHR),
    respiratoryRate: extractNumber(healthData.respiratoryRate),
    vo2max: extractNumber(healthData.vo2max)
  };

  if (healthData.date && healthData.date.length > 10) {
    healthData.date = healthData.date.substring(0, 10);
  }

  console.log('Processed health data:', JSON.stringify(healthData));

  const dataPath = './data.json';
  let data = {};
  try {
    data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  } catch(e) {
    console.log('Starting fresh data.json');
  }

  if (!data.healthLogs) data.healthLogs = [];

  const date = healthData.date || localDateStr(new Date());
  const existingIdx = data.healthLogs.findIndex(h => h.date === date);

  const entry = {
    date,
    // Core recovery metrics
    restingHR: healthData.restingHR || null,           // bpm
    hrv: healthData.hrv || null,                        // ms SDNN
    walkingHR: healthData.walkingHR || null,            // bpm — daily stress proxy

    // Sleep
    sleepHours: healthData.sleepHours || null,          // total hours
    sleepDeep: healthData.sleepDeep || null,            // hours deep
    sleepREM: healthData.sleepREM || null,              // hours REM
    sleepLight: healthData.sleepLight || null,          // hours light
    sleepAwake: healthData.sleepAwake || null,          // hours awake

    // Series 10 sensors
    wristTemp: healthData.wristTemp || null,            // °C deviation from baseline
    respiratoryRate: healthData.respiratoryRate || null, // breaths/min

    // Activity
    steps: healthData.steps || null,
    exerciseMinutes: healthData.exerciseMinutes || null,
    standHours: healthData.standHours || null,

    // Apple fitness estimates
    vo2maxApple: healthData.vo2max || null,             // ml/kg/min

    source: 'apple_health'
  };

  if (existingIdx >= 0) {
    data.healthLogs[existingIdx] = entry;
    console.log(`Updated health log for ${date}`);
  } else {
    data.healthLogs.push(entry);
    console.log(`Added health log for ${date}`);
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
