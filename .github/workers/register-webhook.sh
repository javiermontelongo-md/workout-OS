#!/bin/bash
CLIENT_ID="247568"
CLIENT_SECRET="f2ab78010957b52a3eff890d1e980b2f1fa14ad5"

curl -X POST https://www.strava.com/api/v3/push_subscriptions \
  -F "client_id=${CLIENT_ID}" \
  -F "client_secret=${CLIENT_SECRET}" \
  -F "callback_url=https://strava-webhook.javiermontelongo-md.workers.dev/strava-webhook" \
  -F "verify_token=workout-os-2026"
