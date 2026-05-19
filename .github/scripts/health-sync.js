const fs = require('fs');

function localDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function extractDate(raw) {
  const match = raw.match(/"*date"*\s*:\s*"(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : localDateStr(new Date());
}

function extractSimpleNumber(raw, key) {
  // Handles keys with extra quotes like ""restingHR"
  const re = new RegExp(`"+${key}"+\\s*:\\s*([\\d.]+)`, 'i');
  const match = raw.match(re);
  if (match) {
    const val = parseFloat(match[1]);
    return isNaN(val) ? null : val;
  }
  return null;
}

function extractSleepSeconds(raw) {
  // Sleep comes as sum of durations in seconds
  const re = /"*sleepHours"*\s*:\s*([\d.]+)/i;
  const match = raw.match(re);
  if (match) {
    const seconds = parseFloat(match[1]);
    if (!isNaN(seconds) && seconds > 3600) {
      return Math.round((seconds / 3600) * 10) / 10;
    }
  }
  return null;
}

function extractStepsTotal(raw) {
  // Steps may come as multiple records — find them all and sum
  const singleMatch = raw.match(/"*steps"*\s*:\s*([\d.]+)(?:[^\d]|$)/i);
  if (singleMatch) {
    const val = parseInt(singleMatch[1]);
    if (val > 500) return val;
  }

  const stepsSection = raw.match(/"*steps"*\s*:([\s\S]*?)"*exerciseMinutes"*\s*:/i);
  if (stepsSection) {
    const nums = stepsSection[1].match(/\b(\d+)\b/g);
    if (nums && nums.length > 0) {
      const total = nums.reduce((s, n) => s + parseInt(n), 0);
      console.log(`Steps: summed ${nums.length} records = ${total}`);
      return total;
    }
  }
  return null;
}

async function main() {
  const healthDataRaw = process.env.HEALTH_DATA;
  if (!healthDataRaw) {
    console.log('No health data provided');
    process.exit(0);
  }

  console.log('Raw data preview:', healthDataRaw.substring(0, 2000));

  const date = extractDate(healthDataRaw);
  const restingHR = extractSimpleNumber(healthDataRaw, 'restingHR');
  const hrv = extractSimpleNumber(healthDataRaw, 'hrv');
  const wristTemp = extractSimpleNumber(healthDataRaw, 'wristTemp');
  const sleepHours = extractSleepSeconds(healthDataRaw);
  const steps = extractStepsTotal(healthDataRaw);
  const exerciseMinutes = extractSimpleNumber(healthDataRaw, 'exerciseMinutes');
  const walkingHR = extractSimpleNumber(healthDataRaw, 'walkingHR');
  const respiratoryRate = extractSimpleNumber(healthDataRaw, 'respiratoryRate');
  const vo2max = extractSimpleNumber(healthDataRaw, 'vo2max');

  const entry = {
    date,
    restingHR,
    hrv,
    wristTemp,
    sleepHours,
    sleepDeep: null,
    sleepREM: null,
    sleepLight: null,
    sleepAwake: null,
    steps,
    exerciseMinutes,
    walkingHR,
    respiratoryRate,
    vo2maxApple: vo2max,
    source: 'apple_health'
  };

  console.log('Extracted entry:', JSON.stringify(entry));

  const dataPath = './data.json';
  let data = {};
  try {
    data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  } catch(e) {
    console.log('Starting fresh');
  }

  if (!data.healthLogs) data.healthLogs = [];

  const existingIdx = data.healthLogs.findIndex(h => h.date === date);
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
