#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SEEDER_DIR="$ROOT_DIR/backend/Chiraq.Api.Reset"
API_DIR="$ROOT_DIR/backend/Chiraq.Api"
DB_PATH="${CHIRAQ_DB_PATH:-$API_DIR/chiraq.db}"
if [[ "$DB_PATH" != /* ]]; then DB_PATH="$ROOT_DIR/$DB_PATH"; fi
DB_DIR="$(dirname "$DB_PATH")"
mkdir -p "$DB_DIR"

if command -v lsof >/dev/null 2>&1 && lsof "$DB_PATH" >/dev/null 2>&1; then
  echo "Dayan: verilənlər bazasını istifadə edən proses var. Əvvəlcə lokal API-ni dayandır."
  exit 1
fi

if [[ -f "$DB_PATH" ]]; then
  BACKUP_PATH="${DB_PATH}.backup-$(date +%Y%m%d-%H%M%S)"
  python3 - "$DB_PATH" "$BACKUP_PATH" <<'PY'
import sqlite3
import sys

source = sqlite3.connect(f"file:{sys.argv[1]}?mode=ro", uri=True)
backup = sqlite3.connect(sys.argv[2])
try:
    source.backup(backup)
finally:
    backup.close()
    source.close()
PY
  echo "Ehtiyat nüsxə yaradıldı: $BACKUP_PATH"
fi

rm -f "$DB_PATH" "$DB_PATH-wal" "$DB_PATH-shm"
(
  dotnet build "$SEEDER_DIR/Chiraq.Api.Reset.csproj" --disable-build-servers -p:NuGetAudit=false
  dotnet "$SEEDER_DIR/bin/Debug/net9.0/Chiraq.Api.Reset.dll" "Data Source=$DB_PATH;Foreign Keys=True"
)

echo "Demo bazası yenidən yaradıldı: $DB_PATH"
