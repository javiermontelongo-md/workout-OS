// Cloudflare Worker — Strava webhook relay
// Receives Strava activity events and triggers the strava-sync GitHub Actions workflow.
//
// Required Worker secrets (set via wrangler or Cloudflare dashboard):
//   STRAVA_VERIFY_TOKEN  — any string you choose; used when registering the subscription
//   GITHUB_TOKEN         — GitHub PAT with `repo` scope (or fine-grained: Actions: write)
//
// Deploy:
//   npm install -g wrangler
//   wrangler login
//   wrangler deploy
//
// Then register the Strava webhook subscription (one-time, from your terminal):
//   curl -X POST https://www.strava.com/api/v3/push_subscriptions \
//     -F client_id=YOUR_CLIENT_ID \
//     -F client_secret=YOUR_CLIENT_SECRET \
//     -F callback_url=https://YOUR_WORKER.workers.dev/strava-webhook \
//     -F verify_token=YOUR_STRAVA_VERIFY_TOKEN

const REPO = 'javiermontelongo-md/workout-OS';
const DISPATCH_URL = `https://api.github.com/repos/${REPO}/dispatches`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== '/strava-webhook') {
      return new Response('Not found', { status: 404 });
    }

    // ── GET: Strava subscription verification ────────────────────────────────
    if (request.method === 'GET') {
      const challenge = url.searchParams.get('hub.challenge');
      const token = url.searchParams.get('hub.verify_token');
      if (!challenge || token !== 'workout-os-2026') {
        return new Response('Forbidden', { status: 403 });
      }
      return new Response(JSON.stringify({ 'hub.challenge': challenge }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // ── POST: Strava activity event ──────────────────────────────────────────
    if (request.method === 'POST') {
      const event = await request.json().catch(() => null);
      if (!event) return new Response('Bad request', { status: 400 });

      // Only trigger on activity create (not updates/deletes — sync script handles those)
      if (event.object_type === 'activity' && event.aspect_type === 'create') {
        const resp = await fetch(DISPATCH_URL, {
          method: 'POST',
          headers: {
            Authorization: `token ${env.GITHUB_TOKEN}`,
            Accept: 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            event_type: 'strava-activity',
            client_payload: { activity_id: event.object_id },
          }),
        });

        if (!resp.ok) {
          console.error('GitHub dispatch failed:', resp.status, await resp.text());
          return new Response('Upstream error', { status: 502 });
        }
        console.log(`Triggered strava-sync for activity ${event.object_id}`);
      }

      return new Response('OK');
    }

    return new Response('Method not allowed', { status: 405 });
  },
};
