#!/bin/sh
# Applies the numbered files in migrations/ that this database has not seen yet.
#
#   DATABASE_URL=postgres://user:pass@host:5432/db sh migrate.sh
#
# - Files run in name order (0001_..., 0002_...), each in its own transaction
#   together with the row that records it in schema_migrations. If a file fails,
#   nothing from that file is kept and the script stops.
# - A file that was already applied is skipped. If its content changed since it
#   was applied the script stops: never edit an applied migration, add a new one.
# - Forward only: there is no "down". Files that DROP or TRUNCATE are refused
#   unless they contain the line  -- allow-destructive  (a deliberate decision).
# - It only needs psql and sha256sum, so it runs the same on a laptop, in CI,
#   and inside the postgres image that Ansible uses on the VM.
set -eu
# Keep the output short: hide the "already exists, skipping" notices
export PGOPTIONS="-c client_min_messages=warning"

: "${DATABASE_URL:?DATABASE_URL is not set}"
dir="${MIGRATIONS_DIR:-$(cd "$(dirname "$0")" && pwd)/migrations}"

sql() { psql "$DATABASE_URL" -X -q -v ON_ERROR_STOP=1 "$@"; }

sql -c "CREATE TABLE IF NOT EXISTS schema_migrations (
  version    TEXT PRIMARY KEY,
  checksum   TEXT NOT NULL,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
)"

applied=0
for file in "$dir"/[0-9]*.sql; do
  [ -e "$file" ] || { echo "No migration files found in $dir" >&2; exit 1; }
  version=$(basename "$file" .sql)
  checksum=$(sha256sum "$file" | cut -d' ' -f1)

  recorded=$(sql -tA -c "SELECT checksum FROM schema_migrations WHERE version = '$version'")
  if [ -n "$recorded" ]; then
    if [ "$recorded" != "$checksum" ]; then
      echo "ERROR: $version was changed after it was applied. Do not edit it, add a new migration." >&2
      exit 1
    fi
    continue
  fi

  if grep -qiE '^[[:space:]]*(drop[[:space:]]+(table|schema|database)|truncate)' "$file" \
     && ! grep -q -- '-- allow-destructive' "$file"; then
    echo "ERROR: $version contains DROP or TRUNCATE. Add the line '-- allow-destructive' if that is intended." >&2
    exit 1
  fi

  {
    echo "BEGIN;"
    # Waits here if another run is migrating at the same moment
    echo "SELECT pg_advisory_xact_lock(6500);"
    cat "$file"
    echo
    echo "INSERT INTO schema_migrations (version, checksum) VALUES ('$version', '$checksum');"
    echo "COMMIT;"
  } | sql -f - >/dev/null
  echo "MIGRATED: $version"
  applied=$((applied + 1))
done

echo "Migrations up to date ($applied applied now)."
