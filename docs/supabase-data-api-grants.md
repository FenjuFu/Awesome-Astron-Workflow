# Supabase Data API Grants

This project uses Supabase tables in the `public` schema, so new tables must be created with explicit Data API grants.

## Why this matters

- New Supabase projects created after 2026-05-30 do not expose new `public` tables to PostgREST, GraphQL, or `supabase-js` by default.
- Existing projects keep the old behavior for existing tables, but new tables will require explicit grants once the rollout reaches all projects.
- Grants and RLS are separate layers. A role must have both table privileges and an RLS policy that allows the operation.

## Current project baseline

- `activities`, `registrations`, `redemptions`, `lucky_draws`, `lucky_draw_participants`, and `lucky_draw_winners` already have explicit table grants.
- `chat_logs` is intentionally restricted to `service_role` only.
- `lucky_draw_participants.number` uses `SERIAL`, so its backing sequence also needs explicit grants for API inserts.

## Public table template

Use this pattern whenever you add a new `public` table that should be reachable from the Data API:

```sql
create table public.your_table (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now()
);

alter table public.your_table enable row level security;

create policy "your_table_public_read"
on public.your_table
for select
to anon, authenticated
using (true);

grant select on public.your_table to anon;
grant select, insert, update, delete on public.your_table to authenticated;
grant all on public.your_table to service_role;
```

## Private table template

Use this for server-only tables like logs or internal job data:

```sql
create table public.internal_table (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now()
);

alter table public.internal_table enable row level security;

grant all on public.internal_table to service_role;
```

## Sequence checklist

If a column uses `SERIAL` or identity values and inserts happen through the Data API, also grant access to the backing sequence:

```sql
grant usage, select on sequence public.your_table_id_seq to authenticated;
grant usage, select on sequence public.your_table_id_seq to service_role;
```

Add `anon` too if anonymous inserts are allowed.

## Review checklist

- Create the table.
- Enable RLS.
- Add only the policies each role needs.
- Grant table privileges explicitly.
- Grant sequence privileges when defaults depend on a sequence.
- Check Security Advisor after shipping a new table.
