const fs = require('fs');
const https = require('https');

// ── helpers ──────────────────────────────────────────────────────────────────

function httpsGet(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = { headers };
    https.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error('JSON parse error: ' + data)); }
      });
    }).on('error', reject);
  });
}

function httpsPost(url, body) {
  return new Promise((resolve, reject) => {
    const postData = new URLSearchParams(body).toString();
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error('JSON parse error: ' + data)); }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// ── local date string helper (avoids UTC offset issues) ──────────────────────

function localDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// ── classify run type from activity name and context ─────────────────────────

function classifyRunType(activity) {
  const name = (activity.name || '').toLowerCase();
  const distanceMiles = activity.distance / 1609.34;
  const durationSeconds = activity.moving_time;
  const hrAvg = activity.average_heartrate || null;

  if (distanceMiles >= 6) return 'long';

  if (name.includes('400m') || name.includes('interval') || name.includes('repeat') ||
      name.includes('track') || name.includes('speed') || name.includes('fartlek')) {
    return 'intervals';
  }
  if (name.includes('tempo') || name.includes('threshold') || name.includes('lactate')) {
    return 'tempo';
  }
  if (name.includes('easy') || name.includes('recovery') || name.includes('zone 2') ||
      name.includes('zone2') || name.includes('regeneration')) {
    return 'easy';
  }
  if (name.includes('long') || name.includes('lsd')) return 'long';

  if (hrAvg) {
    if (hrAvg >= 165) return 'intervals';
    if (hrAvg >= 155) return 'tempo';
    if (hrAvg >= 148) return 'moderate';
    return 'easy';
  }

  if (durationSeconds >= 3000) return 'long';
  return 'easy';
}

// ── main ─────────────────────────────────────────────────────────────────────

async function main() {
  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;
  const refreshToken = process.env.STRAVA_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Missing Strava credentials in environment');
  }

  // 1. Get fresh access token using refresh token
  console.log('Getting fresh Strava access token...');
  const tokenRes = await httpsPost('https://www.strava.com/oauth/token', {
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: 'refresh_token'
  });

  if (!tokenRes.access_token) {
    throw new Error('Failed to get access token: ' + JSON.stringify(tokenRes));
  }

  const accessToken = tokenRes.access_token;
  console.log('Access token obtained.');

  // 2. Fetch activities from last 60 days
  const sixtyDaysAgo = Math.floor(Date.now() / 1000) - (60 * 24 * 60 * 60);
  const activitiesUrl = `https://www.strava.com/api/v3/athlete/activities?after=${sixtyDaysAgo}&per_page=100`;

  console.log('Fetching Strava activities...');
  const activities = await httpsGet(activitiesUrl, {
    'Authorization': `Bearer ${accessToken}`
  });

  if (!Array.isArray(activities)) {
    throw new Error('Unexpected activities response: ' + JSON.stringify(activities));
  }

  console.log(`Found ${activities.length} activities.`);

  // 3. Load existing data.json
  const dataPath = './data.json';
  let data = {};
  try {
    data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  } catch (e) {
    console.log('Could not read data.json, starting fresh.');
  }

  if (!data.runs) data.runs = [];

  // 4. Process activities — only Run, skip walks and weight training
  const existingIds = new Set(data.runs.map(r => r.stravaId));
  let newCount = 0;

  for (const activity of activities) {
    const type = activity.type || activity.sport_type || '';
    if (type !== 'Run') continue;

    if (existingIds.has(activity.id)) continue;

    const distanceMiles = activity.distance / 1609.34;
    const durationSeconds = activity.moving_time;
    const paceSecsPerMile = distanceMiles > 0 ? durationSeconds / distanceMiles : null;
    const elevationFeet = (activity.total_elevation_gain || 0) * 3.28084;

    const activityDate = new Date(activity.start_date_local);
    const dateStr = localDateStr(activityDate);

    const runType = type === 'Run' ? classifyRunType(activity) : 'walk';

    const entry = {
      date: dateStr,
      stravaId: activity.id,
      name: activity.name,
      type: type.toLowerCase(),
      distance: Math.round(distanceMiles * 100) / 100,
      duration: durationSeconds,
      pace: paceSecsPerMile ? Math.round(paceSecsPerMile) : null,
      elevationGain: Math.round(elevationFeet),
      heartRateAvg: activity.average_heartrate || null,
      heartRateMax: activity.max_heartrate || null,
      source: 'strava',
      runType: runType
    };

    data.runs.push(entry);
    existingIds.add(activity.id);
    newCount++;
    console.log(`Added: ${dateStr} — ${activity.name} (${entry.distance} mi, ${runType})`);
  }

  // 5. Sort runs by date
  data.runs.sort((a, b) => a.date.localeCompare(b.date));

  // 6. Update last sync timestamp
  data.stravaLastSync = new Date().toISOString();

  // 7. Save data.json
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  console.log(`Done. Added ${newCount} new activities. Total runs: ${data.runs.length}`);
}

main().catch(err => {
  console.error('Sync failed:', err);
  process.exit(1);
});
