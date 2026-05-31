#!/usr/bin/env bash
set -euo pipefail

BASE_URL=${BASE_URL:-http://localhost:3000/api/v1}

echo "Using base URL: $BASE_URL"

echo "1) Login candidate"
TOKEN=$(curl -s -X POST "$BASE_URL/auth/login" -H 'Content-Type: application/json' -d '{"email":"candidate@adlts.et","password":"password123"}' | jq -r '.data.access_token')
if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo "Failed to obtain token" >&2
  exit 2
fi
echo "TOKEN=$TOKEN"

echo "2) Create booking (candidate)"
CREATE=$(curl -s -X POST "$BASE_URL/bookings" -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' -d '{"institute_id":"aau-driving-school","license_category":"B","blood_type":"O+","preferred_exam_date":"2026-06-30","preferred_session":"Morning"}')
echo "$CREATE" | jq -c '.'
BOOKING_ID=$(echo "$CREATE" | jq -r '.data.id')
echo "BOOKING_ID=$BOOKING_ID"

echo "3) Initiate payment"
PAY=$(curl -s -X POST "$BASE_URL/bookings/$BOOKING_ID/payments" -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' -d '{"amount_cents":50000,"currency":"ETB"}')
echo "$PAY" | jq -c '.'
PAY_ID=$(echo "$PAY" | jq -r '.data.id')
PROVIDER_REF=$(echo "$PAY" | jq -r '.data.providerRef // .data.provider_ref // ""')
echo "PAYMENT_ID=$PAY_ID provider_ref=$PROVIDER_REF"

echo "4) List payments"
curl -s -X GET "$BASE_URL/bookings/$BOOKING_ID/payments" -H "Authorization: Bearer $TOKEN" | jq -c '.'

if [ -n "$PROVIDER_REF" ] && [ "$PROVIDER_REF" != "null" ]; then
  echo "5) Simulate provider callback (success)"
  CALLBACK=$(curl -s -X POST "$BASE_URL/bookings/$BOOKING_ID/payments/callback" -H 'Content-Type: application/json' -d "{\"tx_ref\": \"$PROVIDER_REF\", \"status\": \"success\"}")
  echo "$CALLBACK" | jq -c '.'

  echo "6) List payments after callback"
  curl -s -X GET "$BASE_URL/bookings/$BOOKING_ID/payments" -H "Authorization: Bearer $TOKEN" | jq -c '.'
else
  echo "No provider_ref available; skipping callback step"
fi

echo "Smoke test complete"
