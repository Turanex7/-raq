#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
API_DIR="$ROOT_DIR/backend/Chiraq.Api"
FRONTEND_DIR="$ROOT_DIR/frontend"

load_env_file() {
  local env_path="$1"
  [[ -f "$env_path" ]] || return 0
  while IFS='=' read -r key value || [[ -n "${key:-}" ]]; do
    key="${key%%#*}"
    key="${key//[[:space:]]/}"
    [[ "$key" =~ ^[A-Za-z_][A-Za-z0-9_]*$ ]] || continue
    value="${value%$'\r'}"
    value="${value#"${value%%[![:space:]]*}"}"
    value="${value%"${value##*[![:space:]]}"}"
    if [[ "$value" == \"*\" || "$value" == \'*\' ]]; then value="${value:1:${#value}-2}"; fi
    if [[ -z "${!key-}" ]]; then export "$key=$value"; fi
  done < "$env_path"
}

load_env_file "$API_DIR/.env"
load_env_file "$FRONTEND_DIR/.env"

if [[ -z "${ADMIN_TOKEN:-}" || "$ADMIN_TOKEN" == "replace-this-demo-admin-token-with-at-least-24-characters" ]]; then
  ADMIN_TOKEN="local-demo-admin-key-change-before-sharing-2026"
  echo "Lokal demo admin açarı: $ADMIN_TOKEN"
fi
if [[ ${#ADMIN_TOKEN} -lt 24 ]]; then
  echo "ADMIN_TOKEN ən azı 24 simvol olmalıdır." >&2
  exit 1
fi

export DEMO_MODE=true
export ADMIN_TOKEN
export JWT_SECRET="${JWT_SECRET:-local-demo-jwt-secret-change-before-sharing-2026}"
export QR_HMAC_SECRET="${QR_HMAC_SECRET:-local-demo-qr-secret-change-before-sharing-2026}"
export CORS_ORIGINS__0="${CORS_ORIGINS__0:-http://localhost:5173}"
export ASPNETCORE_URLS=http://localhost:5099

ensure_port_free() {
  local port="$1"
  if command -v lsof >/dev/null 2>&1 && lsof -nP -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1; then
    echo "Port $port artıq istifadə olunur. Mövcud prosesi dayandırıb yenidən yoxla." >&2
    return 1
  fi
}

ensure_port_free 5099
ensure_port_free 5173

if [[ ! -d "$FRONTEND_DIR/node_modules" ]]; then
  if [[ -f "$FRONTEND_DIR/package-lock.json" ]]; then
    (cd "$FRONTEND_DIR" && npm ci)
  else
    (cd "$FRONTEND_DIR" && npm install)
  fi
fi

dotnet build "$API_DIR/Chiraq.Api.csproj" --disable-build-servers -p:NuGetAudit=false

BACKEND_PID=""
FRONTEND_PID=""
stop_services() {
  for pid in "$FRONTEND_PID" "$BACKEND_PID"; do
    if [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null; then kill -TERM "$pid" 2>/dev/null || true; fi
  done
  [[ -z "$FRONTEND_PID" ]] || wait "$FRONTEND_PID" 2>/dev/null || true
  [[ -z "$BACKEND_PID" ]] || wait "$BACKEND_PID" 2>/dev/null || true
}
trap stop_services EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

(cd "$API_DIR" && exec dotnet bin/Debug/net9.0/Chiraq.Api.dll) &
BACKEND_PID=$!
(cd "$FRONTEND_DIR" && exec ./node_modules/.bin/vite --host 0.0.0.0 --port 5173) &
FRONTEND_PID=$!

attempt=0
until curl --silent --fail http://localhost:5173/api/health >/dev/null 2>&1; do
  if ! kill -0 "$BACKEND_PID" 2>/dev/null || ! kill -0 "$FRONTEND_PID" 2>/dev/null; then
    echo "API və ya frontend başladılmadı. Yuxarıdakı çıxışa bax." >&2
    exit 1
  fi
  attempt=$((attempt + 1))
  if (( attempt >= 90 )); then
    echo "90 saniyə ərzində /api/health cavabı alınmadı." >&2
    exit 1
  fi
  sleep 1
done

echo
echo "Çıraq hazırdır: http://localhost:5173"
echo "API yoxlaması: http://localhost:5099/api/health"
if command -v ipconfig >/dev/null 2>&1; then
  LAN_IP="$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || true)"
  if [[ -n "$LAN_IP" ]]; then echo "Eyni Wi-Fi şəbəkəsində telefon: http://$LAN_IP:5173"; fi
fi
echo "Dayandırmaq üçün Ctrl+C bas."
while kill -0 "$BACKEND_PID" 2>/dev/null && kill -0 "$FRONTEND_PID" 2>/dev/null; do sleep 1; done
echo "API və ya frontend prosesi dayandı." >&2
exit 1
