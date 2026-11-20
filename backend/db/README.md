# Database: migrations

| File | What it is for |
| ---- | -------------- |
| `migrations/NNNN_name.sql` | **Production.** Numbered, forward-only changes to the schema. |
| `migrate.sh` | Applies the migrations a database has not seen yet. |
| `schema.sql` | **Development and tests only.** Drops everything and rebuilds it. Never run it on production. |
| `seed.sql` | Sample data. Loaded only into a brand new database. |

## How it works

`migrate.sh` creates a `schema_migrations` table (`version`, `checksum`,
`applied_at`) and then goes through `migrations/` in name order:

- A migration that is not in `schema_migrations` runs in its own transaction,
  together with the row that records it. If it fails, nothing from it is kept.
- A migration that is already recorded is skipped, so running it again is safe.
- If an applied file was edited afterwards, the script stops with an error.
- A file containing `DROP TABLE`, `DROP SCHEMA`, `DROP DATABASE` or `TRUNCATE` is
  refused unless it has the line `-- allow-destructive`.

On the VM, the Ansible `app` role runs it on every deploy, inside the
`postgres:16-alpine` image, before the new containers start. A deploy with no new
migration changes nothing. The first run on the live database (which was created
from `schema.sql`) records `0001` and leaves the data untouched.

## Add a migration

1. Create the next number: `backend/db/migrations/0002_add_unit_to_prices.sql`.
   Four digits, then a short name with underscores.
2. Write plain SQL that changes the schema and keeps the rows. Make it safe to
   run twice, with `IF NOT EXISTS` / `IF EXISTS`:

   ```sql
   ALTER TABLE prices ADD COLUMN IF NOT EXISTS unit TEXT NOT NULL DEFAULT 'kg';
   ```

   Do not write `BEGIN` or `COMMIT`; the script wraps the file in a transaction.
3. Make the same change in `schema.sql`, so development and tests match production.
4. Try it on a local database (see below), then open a PR. The next deploy
   applies it.

Rules: never edit or rename a migration that has been merged (add a new one
instead); never put a `DROP` in one unless you really mean to lose data, and then
say why in the PR. To undo a change, write a new migration that reverses it.

## Run it by hand

You need `psql`. From the repository root:

```sh
export DATABASE_URL=postgres://agripulse:agripulse@localhost:5432/agripulse
sh backend/db/migrate.sh
```

It prints `MIGRATED: <name>` for each file it applied and
`Migrations up to date (N applied now).` at the end.
