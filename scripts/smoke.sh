#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${SMOKE_BASE_URL:-http://localhost:5173}"
BODY_FILE="$(mktemp -t chiraq-smoke.XXXXXX)"
trap 'rm -f "$BODY_FILE"' EXIT
FAILURES=0

check_status() {
  local label="$1" path="$2" expected="$3" auth="${4:-}"
  local status
  if [[ -n "$auth" ]]; then
    status="$(curl --silent --output "$BODY_FILE" --max-time 10 --write-out '%{http_code}' -H "Authorization: Bearer $auth" "$BASE_URL$path" 2>/dev/null || true)"
  else
    status="$(curl --silent --output "$BODY_FILE" --max-time 10 --write-out '%{http_code}' "$BASE_URL$path" 2>/dev/null || true)"
  fi
  if [[ "$status" == "$expected" ]]; then
    printf 'PASS  %s\n' "$label"
  else
    printf 'FAIL  %s (HTTP %s, gözlənilən %s)\n' "$label" "${status:-000}" "$expected"
    FAILURES=$((FAILURES + 1))
  fi
}

check_status "API health" "/api/health" "200"
check_status "Məkanlar API-si" "/api/places" "200"
if [[ -n "${API_AUTH_TOKEN:-}" ]]; then
  check_status "Liderlər API-si" "/api/leaderboard" "200" "$API_AUTH_TOKEN"
else
  check_status "Liderlər API-si (giriş qoruması)" "/api/leaderboard" "401"
fi

if (( FAILURES > 0 )); then
  printf '%s yoxlama uğursuz oldu.\n' "$FAILURES" >&2
  exit 1
fi
echo "Bütün smoke yoxlamaları keçdi."
