/*
# Create activity log for mood check-ins and completed sessions

## Plain-English summary
This app has no login screen, so it works the same way for every visitor on
this device. To power the streak counter, the daily mood check-in, and the
"Growth" progress screen, we need one place to record two kinds of events:
1. A student picking how they feel today ("Yorgun", "Stresli", "Normal", "İyi").
2. A student finishing a guided meditation or exercise session.

## New Tables
- `activity_log`
  - `id` (uuid, primary key) — unique row id.
  - `activity_type` (text) — either `mood`, `meditation`, or `exercise`.
  - `activity_value` (text) — the mood key (e.g. `iyi`) or the session id
    (e.g. `nefes-4-4-7`) that was completed.
  - `created_at` (timestamptz) — when the event happened, used to compute the
    daily streak and weekly stats.

## Security
- Row Level Security is enabled.
- Because there is no sign-in, both the `anon` and `authenticated` roles are
  allowed to insert and read rows — the data is intentionally shared on this
  single-tenant app, not tied to any private user account.
- This is an append-only log: no update or delete policy is created, so past
  entries can never be altered or removed through the API.

## Notes
- An index on `(activity_type, created_at)` keeps the streak/weekly queries fast.
*/

CREATE TABLE IF NOT EXISTS activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_type text NOT NULL CHECK (activity_type IN ('mood', 'meditation', 'exercise')),
  activity_value text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_log_type_created
  ON activity_log (activity_type, created_at);

ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_activity_log" ON activity_log;
CREATE POLICY "anon_select_activity_log" ON activity_log FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_activity_log" ON activity_log;
CREATE POLICY "anon_insert_activity_log" ON activity_log FOR INSERT
  TO anon, authenticated WITH CHECK (true);
