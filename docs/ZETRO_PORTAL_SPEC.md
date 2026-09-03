# Zetro Client Portal — Shared Spec

**Version:** 0.3
**Owners:** Nicolás (backend, database, migrations) · Frontend dev (Next.js app, UI)
**Status:** contract. Both of us keep this file open. If the code and this file disagree, one of them is a bug.

---

## 0. How to use this document

- This is the **only** shared source of truth between backend and frontend. Table names, column names, RPC names, endpoint paths and payload shapes here are binding.
- Anything not written here is **not agreed**. If you need something that isn't here, propose it in `#13 Open questions`, get a yes, then write it down.
- Backend changes the contract → backend bumps the version in the header and adds a line to `#14 Changelog`. Frontend pulls the new file before starting anything that touches a changed area.
- Frontend never invents a table or a column. If data isn't reachable through what's listed in `#7 API surface`, that's a backend ticket, not a frontend workaround.
- When the backend phase closes, frontend receives a second file, `ZETRO_BACKEND_HANDOFF.md`, saying what actually shipped and what didn't. **That file wins over this one** for "does it exist yet"; this one still wins for "how is it shaped".

---

## 1. Product

Zetro builds websites for startups and local businesses — cheap and fast. The portal is two things in one Next.js app:

1. **Marketing site** (public): a landing page that sells that idea, with real examples of sites we shipped, and a contact form.
2. **Client portal** (private): where a client logs in and runs the thing we built for them — bookings, customers, their site's traffic, their menu/classes/events.

### MVP verticals

Restaurant · Café · Gym · Barbershop. Plus a **generic** vertical: any business that takes bookings.

The insight driving the schema: all four are the same problem. Someone reserves a *resource* (a table, a chair, a room, a coach) for a *service* (dinner, a haircut, a class) in a *time slot*. We model that once and let the vertical decide the vocabulary and which extra modules turn on. We do not build four apps.

### In scope for MVP

- Landing + examples + contact form (leads land in the DB).
- Auth: email login for client staff, invite flow, Zetro platform admin.
- Bookings: resources, services, opening hours, exceptions, availability lookup, booking create/cancel/reschedule, calendar and list views.
- Public booking widget/endpoint so a client's own site can take reservations.
- Google Calendar link: bookings push to the client's calendar.
- Customers list built from bookings.
- Website statistics per client site.
- Vertical extras: menu (restaurant/café), events, group classes (gym).
- Zetro admin dashboard template: list clients, create one, set their plan state, look at their data for support.

### Out of scope for MVP (say it out loud so nobody builds it)

- **Billing/payments of any kind.** Monthly fees are collected by hand, outside the app. There is one read-mostly table (`payment_records`) that Zetro admin fills in so the client can see "paid / pending" — no provider, no checkout, no webhooks, no card data. Ever, in v1.
- Online ordering / delivery / POS.
- Email or WhatsApp campaigns (we store `marketing_opt_in`, we don't send).
- Multi-language UI (copy is Spanish, hardcoded, see `#13`).
- Mobile apps.
- Two-way Google Calendar sync (we push; we don't consume their edits — see `#9`).

---

## 2. Roles

| Role | Where it lives | Can |
|---|---|---|
| `platform_admin` | `profiles.is_platform_admin` | Everything, across every org. Zetro staff only. |
| `owner` | `memberships.role` | Everything inside their org, including inviting members and changing settings/integrations. |
| `manager` | `memberships.role` | Everything operational: bookings, customers, menu, events, classes, analytics. No member management, no integrations. |
| `staff` | `memberships.role` | Bookings and customers. Read-only on settings, menu, analytics. |
| anonymous | — | Landing pages, public availability lookup, public booking creation, contact form. Nothing else. |

One user can belong to several orgs (a guy who owns a café and a gym). The portal is org-scoped by URL: `/panel/[orgSlug]/…`. A literal `/panel` segment, not a route group — `/[orgSlug]` at the root would collide with `/contacto`, `/trabajos` and `/login`.

---

## 3. Architecture

```
                 ┌──────────────────────────────────────┐
  visitors ────► │  zetro.com  (marketing, public)      │
                 │  Next.js 16 App Router · Vercel      │
  clients  ────► │  /panel/[org]/…  (portal, auth'd)    │
  Zetro    ────► │  /admin/…      (platform console)    │
                 │  /api/…        (route handlers)      │
                 └───────────────┬──────────────────────┘
                                 │ supabase-js (anon key + RLS)
                                 │ service role only inside /api
                                 ▼
                 ┌──────────────────────────────────────┐
                 │  Supabase (Postgres 17)              │
                 │  auth · RLS · RPC · cron · vault     │
                 └───────────────▲──────────────────────┘
                                 │ POST /api/collect (beacon)
                 ┌───────────────┴──────────────────────┐
                 │  client sites (one Vercel project    │
                 │  each, built by Zetro, Next.js)      │
                 └──────────────────────────────────────┘
```

- **One Supabase project, one Next.js app, multi-tenant.** Every business is an `org`; every row that belongs to a business carries `org_id`; RLS does the isolation. No per-client database, no per-client deploy of the portal.
- Client **websites** are still separate Vercel projects (they have their own domains and designs). They talk to the portal over three public endpoints only: analytics collect, availability, booking create. They never hold a Supabase key.
- Deploys: Vercel. Migrations: written by the backend agent as SQL files, pushed by Nicolás with `supabase db push`. Nobody else touches the DB schema.

### Repo layout

```
zetro-portal/
  app/                      # next.js app router (see #11)
  components/
  lib/
    supabase/               # server.ts, client.ts, service.ts, types.ts
    booking/                # availability math shared by api + ui
    analytics/
  supabase/
    migrations/             # NNNN_name.sql, forward only
    seed.sql
    functions/              # only if an edge function is unavoidable
  docs/
    ZETRO_PORTAL_SPEC.md    # this file
    ZETRO_BACKEND_HANDOFF.md
```

---

## 4. Conventions

Non-negotiable, both sides:

- Postgres identifiers: `snake_case`, tables plural (`bookings`, `menu_items`), FKs `<singular>_id`.
- PKs: `uuid default gen_random_uuid()`. Exception: `analytics_events` uses `bigint generated always as identity` (volume).
- Every business table has `org_id uuid not null references orgs(id) on delete cascade`, even when it could be derived through a join. Policies and analytics queries get cheaper and simpler; the denormalisation is deliberate.
- `created_at timestamptz not null default now()`, `updated_at timestamptz` maintained by a trigger where it matters.
- All timestamps are stored in UTC. Display uses `orgs.timezone` (default `America/Argentina/Buenos_Aires`). The frontend never assumes the browser timezone for business data.
- Money: `*_cents integer` + `currency char(3) default 'ARS'`. No floats anywhere near money.
- Deletion: hard delete only for junk (leads, analytics). Business rows get `archived_at timestamptz` and are filtered, never removed.
- Enums are Postgres enums, listed in `#5.0`. Adding a value is a migration; the frontend must handle an unknown value without crashing (fallback label, never a blank screen).
- JSON: `jsonb`, and only for genuinely open-ended settings. If we query it twice, it becomes a column.
- Errors from `/api/*` always look like `#7.0`.

### 4.1 Code habits — both of us, and any assistant either of us uses

These apply to the frontend repo exactly as much as the backend one. If you use Claude, Cursor, Copilot or anything else, these rules go into its instructions before it writes a line.

**1. The assistant never runs git.** No commit, no push, no branch, no `gh`. It writes files; a human reviews, stages and commits. A commit nobody read is a commit nobody owns.

**2. Comments: almost none.** No file headers, no docblocks, no "// fetch the user", no numbered "Step 1 / Step 2" banners, no `// TODO(assistant)`, no emoji. A short lowercase note only where the *why* is genuinely non-obvious — a workaround, a business rule that looks wrong but isn't, a perf trick. Terse, no third person, the way you'd leave a note for yourself.

```ts
// good
// vercel geo header is missing on localhost
const country = req.headers.get('x-vercel-ip-country') ?? 'AR'

// bad
// This function retrieves the country from the request headers,
// falling back to Argentina if the header is not present.
```

Anyone reading this repo should conclude one person typed it. Not a team, not a tool.

**3. No generated-code tells.** No "Generated with", no changelog comments inside files, no defensive `try/catch` around code that can't throw, no `eslint-disable` sprinkled to silence something instead of fixing it, no README nobody asked for, no `example.ts` left behind.

**4. Stable versions only.** Latest *stable* release of everything — never canary, beta, rc, alpha or `@next`. Check the actual current version at install time (`npm view next version`) instead of trusting what the model remembers; training data goes stale and it will confidently install something a year old or something that doesn't exist. Pin exact versions in `package.json` (no `^`), commit the lockfile, and don't take a major upgrade mid-phase. Node LTS. No experimental framework flags (`ppr`, `dynamicIO`, `unstable_*`) unless we talked about it first.

**5. No new dependency without asking.** Date formatting is `Intl`. A dropdown is shadcn. If something genuinely needs a library, say which and why, then wait. Four dependencies for a landing page is how a cheap-and-fast agency stops being fast.

**6. Delete instead of keeping.** No commented-out code, no `_old` files, no unused exports, no half-built screens sitting in the tree. Git remembers; the repo shouldn't.

**7. Don't invent the contract.** Backend doesn't rename what the frontend already codes against; frontend doesn't query a table that isn't in `#5`. Either way it's a message first, a change second.

**8. Say what didn't work.** Unfinished is fine and expected. Unfinished described as finished costs the other person a day.

---

## 5. Data model

### 5.0 Enums

```sql
create type vertical_type   as enum ('restaurant','cafe','gym','barbershop','generic');
create type org_status      as enum ('trial','active','paused','archived');
create type member_role     as enum ('owner','manager','staff');
create type resource_kind   as enum ('table','chair','room','court','staff','equipment');
create type booking_status  as enum ('pending','confirmed','seated','completed','cancelled','no_show');
create type booking_source  as enum ('portal','public_site','walk_in','phone','google');
create type payment_status  as enum ('paid','pending','overdue','waived');
create type lead_status     as enum ('new','contacted','won','lost');
```

### 5.1 Tenancy and identity

**`orgs`** — one client business.

| column | type | notes |
|---|---|---|
| id | uuid pk | |
| name | text not null | "Bar Chelo" |
| slug | text not null unique | url segment, lowercase, `[a-z0-9-]` |
| vertical | vertical_type not null | drives which modules the UI shows |
| status | org_status not null default `'trial'` | `paused` = we stop showing data, they still log in |
| timezone | text not null default `'America/Argentina/Buenos_Aires'` | IANA |
| currency | char(3) not null default `'ARS'` | |
| logo_url, phone, address, whatsapp | text | shown in portal header and public widget |
| settings | jsonb not null default `'{}'` | vertical knobs, see `#5.8` |
| created_at, updated_at | timestamptz | |

**`sites`** — a website we built for an org. An org can have more than one (rare, but analytics needs the split).

| column | type | notes |
|---|---|---|
| id | uuid pk | |
| org_id | uuid not null | |
| name | text not null | "sitio principal" |
| domain | text not null | `barchelo.com.ar`, no scheme |
| public_key | text not null unique | `zs_` + 24 random chars. Goes in the client site's env. Public, write-only capability. |
| vercel_project_id | text | for our own bookkeeping |
| status | text not null default `'live'` | `live` / `building` / `paused` |
| created_at | timestamptz | |

**`profiles`** — 1:1 with `auth.users`, created by a trigger on signup.

`id uuid pk references auth.users(id) on delete cascade`, `full_name`, `phone`, `avatar_url`, `is_platform_admin boolean not null default false`, `created_at`.

**`memberships`** — `id`, `org_id`, `user_id references profiles(id)`, `role member_role not null`, `created_at`, `unique (org_id, user_id)`. Index on `user_id`.

**`invites`** — `id`, `org_id`, `email citext not null`, `role member_role not null`, `token_hash text not null`, `expires_at timestamptz not null`, `accepted_at`, `invited_by uuid`, `created_at`. Raw token is never stored; it's emailed and hashed here.

### 5.2 Booking core (shared by every vertical)

**`resources`** — the thing being reserved.

| column | type | notes |
|---|---|---|
| id | uuid pk | |
| org_id | uuid not null | |
| name | text not null | "Mesa 4", "Sillón 2", "Sala de spinning", "Nico" |
| kind | resource_kind not null | |
| capacity | integer not null default 1 | seats at a table, spots in a room |
| user_id | uuid null references profiles(id) | set when the resource is a person who also logs in |
| is_active | boolean not null default true | |
| sort_order | integer not null default 0 | |
| metadata | jsonb not null default `'{}'` | e.g. `{"zone":"patio","smoking":false}` |
| archived_at | timestamptz | |

**`services`** — what gets booked into a resource.

`id`, `org_id`, `name`, `description`, `duration_minutes integer not null`, `buffer_before_minutes integer not null default 0`, `buffer_after_minutes integer not null default 0`, `price_cents integer`, `currency char(3)`, `is_public boolean not null default true` (bookable from the client's website), `is_active`, `sort_order`, `archived_at`.

A restaurant that just seats people still gets one service ("Reserva", 90 min). Keeps the UI uniform.

**`service_resources`** — `service_id`, `resource_id`, pk on both. Which resources can deliver which service. Empty set for a service = any active resource.

**`availability_rules`** — recurring opening hours.

`id`, `org_id`, `resource_id uuid null` (null = applies to the whole org), `weekday smallint not null check (weekday between 0 and 6)` (0 = Sunday), `opens_at time not null`, `closes_at time not null`, `check (closes_at > opens_at)`. Split shifts = two rows (12:00–15:30 and 20:00–00:00 → the second row ends at `23:59`, we do not model past-midnight service in v1; see `#13`).

**`availability_exceptions`** — holidays and one-offs.

`id`, `org_id`, `resource_id uuid null`, `date date not null`, `is_closed boolean not null default true`, `opens_at time`, `closes_at time`, `note text`.

**`customers`** — the client's customers, not our clients.

`id`, `org_id`, `full_name`, `email citext`, `phone text`, `notes text`, `marketing_opt_in boolean not null default false`, `visits_count integer not null default 0`, `last_visit_at timestamptz`, `created_at`. Unique index `(org_id, lower(email)) where email is not null`, plus `(org_id, phone) where phone is not null`. Deduped on booking creation by email then phone.

**`bookings`** — the centre of the app.

| column | type | notes |
|---|---|---|
| id | uuid pk | |
| org_id | uuid not null | |
| resource_id | uuid not null references resources(id) | |
| service_id | uuid null references services(id) | |
| customer_id | uuid null references customers(id) | null for a walk-in nobody named |
| starts_at | timestamptz not null | |
| ends_at | timestamptz not null | `check (ends_at > starts_at)` |
| party_size | integer not null default 1 | `check (party_size > 0)` |
| status | booking_status not null default `'pending'` | |
| source | booking_source not null default `'portal'` | |
| notes | text | what the customer wrote |
| internal_notes | text | staff only, never returned by public endpoints |
| google_event_id | text | see `#9` |
| created_by | uuid null references profiles(id) | null when created from the public site |
| cancelled_at, cancellation_reason | | |
| created_at, updated_at | | |

Double booking is prevented in the database, not in application code:

```sql
create extension if not exists btree_gist;

alter table bookings add constraint bookings_no_overlap
  exclude using gist (
    resource_id with =,
    tstzrange(starts_at, ends_at, '[)') with &&
  ) where (status not in ('cancelled','no_show'));
```

Buffers are applied when computing `starts_at`/`ends_at` at creation time, so the constraint stays honest. Indexes: `(org_id, starts_at desc)`, `(org_id, status)`, `(customer_id)`.

**`booking_events`** — audit trail. `id`, `booking_id`, `org_id`, `actor_id uuid null`, `from_status`, `to_status`, `meta jsonb`, `at timestamptz default now()`. Written by a trigger on `bookings` status change. Never updated.

### 5.3 Group capacity (gym classes, ticketed events)

Exclusive resources use the exclusion constraint above. Anything where many people share one slot uses these instead — an 8am spinning class is one session with 20 spots, not 20 overlapping bookings.

**`group_sessions`** — `id`, `org_id`, `service_id not null`, `resource_id null`, `instructor_resource_id uuid null references resources(id)`, `starts_at`, `ends_at`, `capacity integer not null`, `booked_count integer not null default 0`, `status text not null default 'scheduled'`, `created_at`.

**`session_registrations`** — `id`, `org_id`, `session_id`, `customer_id`, `status booking_status not null default 'confirmed'`, `created_at`, `unique (session_id, customer_id)`.

`booked_count` is maintained by a trigger that locks the session row (`select … for update`) and rejects the insert when full. Do not trust a count done in the app.

### 5.4 Vertical extras

**Restaurant / café**

- `menu_sections` — `id`, `org_id`, `name`, `sort_order`, `is_visible`.
- `menu_items` — `id`, `org_id`, `section_id`, `name`, `description`, `price_cents`, `currency`, `image_url`, `is_available boolean default true`, `tags text[]` (`{vegan,sin-tacc,picante}`), `sort_order`, `archived_at`.

**Events (any vertical)**

- `events` — `id`, `org_id`, `title`, `description`, `starts_at`, `ends_at`, `capacity integer null`, `price_cents`, `cover_url`, `is_published boolean default false`, `created_at`. Attendance reuses `group_sessions`/`session_registrations` only if the event actually takes reservations; otherwise it's just content the client's site renders.

**Gym** — classes are `services` (name, duration) scheduled as `group_sessions`; coaches are `resources` with `kind='staff'`. No gym-specific tables.

**Barbershop** — chairs or barbers are `resources`; cuts are `services` with a price. No barbershop-specific tables.

### 5.5 Leads (from the marketing site and client sites)

**`leads`** — `id`, `org_id uuid null` (null = a lead for Zetro itself, from zetro.com), `site_id uuid null`, `name`, `email`, `phone`, `message`, `source_path text`, `status lead_status not null default 'new'`, `created_at`. Zetro's own leads are visible to platform admins only.

### 5.6 Analytics

See `#10` for the design rationale. Tables:

**`analytics_events`** (raw, in schema `private`) — `id bigint identity pk`, `site_id`, `org_id`, `occurred_at timestamptz not null default now()`, `kind text not null default 'pageview'`, `name text`, `path text not null`, `referrer_host text`, `utm_source`, `utm_medium`, `utm_campaign`, `country char(2)`, `device_type text`, `browser text`, `visitor_hash text not null`, `session_id text not null`, `meta jsonb`. Index `(site_id, occurred_at desc)`. Retention: 180 days.

**`analytics_daily_totals`** (public) — `site_id`, `org_id`, `day date`, `pageviews int`, `visitors int`, `sessions int`, `bounce_sessions int`, pk `(site_id, day)`.

**`analytics_daily_breakdown`** (public) — `site_id`, `org_id`, `day date`, `dimension text` (`path` | `referrer` | `utm_source` | `device` | `country`), `value text`, `pageviews int`, `visitors int`, pk `(site_id, day, dimension, value)`.

Rollups are computed by `private.rollup_analytics(day date)`; the dashboard reads only the two rollup tables plus a live view. It never scans raw events.

### 5.7 Operations (Zetro-side)

**`payment_records`** — manual bookkeeping, no provider. `id`, `org_id`, `period_month date not null` (always day 1), `amount_cents`, `currency`, `status payment_status not null default 'pending'`, `due_date date`, `paid_at timestamptz`, `method text` (`transferencia`, `efectivo`, …), `note text`, `recorded_by uuid`, `created_at`, `unique (org_id, period_month)`. Written by platform admins only. Clients read their own rows so the portal can show "septiembre: pendiente". No amounts are computed by the app.

**`audit_log`** — `id`, `org_id null`, `actor_id null`, `action text`, `entity text`, `entity_id uuid`, `meta jsonb`, `at timestamptz default now()`. Written for member changes, integration changes, admin impersonation and payment records.

### 5.8 `orgs.settings` shape

Open-ended on purpose, but these keys are agreed:

```jsonc
{
  "booking": {
    "slot_minutes": 30,           // grid the public widget offers
    "lead_time_minutes": 60,      // how soon can someone book from now
    "max_days_ahead": 60,
    "auto_confirm": true,         // false → bookings land as 'pending'
    "require_phone": true,
    "max_party_size": 12
  },
  "modules": { "menu": true, "events": true, "classes": false },
  "public_widget": { "primary_color": "#111111", "show_prices": true }
}
```

Frontend reads `modules` to decide which nav items exist. Defaults live in one place, `lib/org/defaults.ts`, and the backend RPCs apply the same defaults server-side.

---

## 6. Security model (RLS)

RLS is **on for every table**, including the ones nobody reads directly. A table without a policy is a table nobody can read — that's the intended default.

Helpers live in the `private` schema, are `security definer`, `stable`, and pin `set search_path = ''`:

```sql
create schema if not exists private;

create or replace function private.is_platform_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select coalesce((select p.is_platform_admin from public.profiles p where p.id = auth.uid()), false);
$$;

create or replace function private.is_member(target_org uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select private.is_platform_admin()
      or exists (select 1 from public.memberships m
                 where m.org_id = target_org and m.user_id = auth.uid());
$$;

create or replace function private.has_role(target_org uuid, roles public.member_role[])
returns boolean language sql stable security definer set search_path = '' as $$
  select private.is_platform_admin()
      or exists (select 1 from public.memberships m
                 where m.org_id = target_org and m.user_id = auth.uid() and m.role = any(roles));
$$;
```

Policy shape, applied to every org-scoped table:

```sql
alter table public.bookings enable row level security;

create policy bookings_select on public.bookings
  for select using (private.is_member(org_id));

create policy bookings_write on public.bookings
  for all using (private.has_role(org_id, array['owner','manager','staff']::public.member_role[]))
       with check (private.has_role(org_id, array['owner','manager','staff']::public.member_role[]));
```

Tighter than that where it matters:

| Table | select | insert/update/delete |
|---|---|---|
| `orgs`, `sites` | members | `owner` (org fields), platform admin (status, slug, sites) |
| `memberships`, `invites` | members | `owner` only |
| `resources`, `services`, `availability_*` | members | `owner`,`manager` |
| `bookings`, `customers`, `group_sessions`, `session_registrations` | members | `owner`,`manager`,`staff` |
| `menu_*`, `events` | members | `owner`,`manager` |
| `analytics_daily_*` | members | nobody (written by the rollup function) |
| `payment_records` | members (own org) | platform admin only |
| `leads` | members; org-less leads → platform admin | `owner`,`manager` (status only) |
| `audit_log`, `private.*` | platform admin | nobody |

Rules that are easy to get wrong, so they're written down:

- The **anon key never sees an unfiltered table**. Public traffic goes through `/api/public/*` route handlers that use the service role and validate a `sites.public_key`. There is no anonymous `select` policy on anything.
- `internal_notes`, `customers.notes`, `email` and `phone` never leave a public endpoint. Public availability returns free slots, not who booked them.
- Service-role client is constructed in one file (`lib/supabase/service.ts`) which throws if imported into a client component. Never in a server component that renders user HTML.
- Platform-admin access to client data is logged in `audit_log` on every read of an org the admin isn't a member of.
- If a policy needs a subquery on the same table it protects, it's wrong — move it into a `private` helper.

Custom access-token hook (org ids as JWT claims) is a **performance optimisation for later**, not v1. Revisit when `is_member` shows up in slow queries.

---

## 7. API surface

Three ways data moves. Pick by this rule: **reads for logged-in users go through supabase-js + RLS; anything transactional or public goes through an RPC or a route handler.**

### 7.0 Error shape

Every non-2xx from `/api/*`:

```json
{ "error": { "code": "slot_taken", "message": "Ese horario ya no está disponible", "details": {} } }
```

Codes: `unauthorized` `forbidden` `not_found` `validation_failed` `slot_taken` `capacity_full` `rate_limited` `integration_error` `server_error`. `message` is Spanish and safe to render as-is. `details` is for the frontend, not the user.

### 7.1 Public endpoints (no auth, `site_key` required)

| Method | Path | Body / query | Returns |
|---|---|---|---|
| POST | `/api/collect` | beacon payload, see `#10.2` | `204`, always |
| GET | `/api/public/availability` | `site_key`, `service_id`, `date` (YYYY-MM-DD), `party_size?` | `{ slots: [{ starts_at, ends_at, resource_id }] }` |
| POST | `/api/public/bookings` | `{ site_key, service_id, starts_at, party_size, customer:{ full_name, email?, phone? }, notes? }` | `{ booking: { id, status, starts_at, ends_at } }` |
| POST | `/api/public/leads` | `{ site_key?, name, email, phone?, message }` | `{ ok: true }` |

All four: `Origin` checked against `sites.domain` (plus zetro.com for the marketing form), rate limited per IP+key, payloads validated with zod, bodies capped at 4 KB. `POST /api/public/bookings` respects `settings.booking.auto_confirm`, `lead_time_minutes`, `max_days_ahead`, `max_party_size`, and creates or dedupes the customer.

### 7.2 RPCs (authenticated, called with the user's session so RLS applies)

| Function | Args | Returns |
|---|---|---|
| `get_availability` | `p_org uuid, p_service uuid, p_from date, p_to date, p_party_size int` | rows of `(starts_at, ends_at, resource_id, resource_name)` |
| `create_booking` | `p_org, p_resource, p_service, p_starts_at, p_party_size, p_customer jsonb, p_notes` | `bookings` row |
| `reschedule_booking` | `p_booking, p_starts_at, p_resource` | `bookings` row |
| `set_booking_status` | `p_booking, p_status, p_reason` | `bookings` row |
| `register_for_session` | `p_session, p_customer jsonb` | `session_registrations` row |
| `dashboard_summary` | `p_org, p_from date, p_to date` | one row: bookings today, next 7 days, cancellations, new customers, pageviews, top path |
| `analytics_overview` | `p_site, p_from date, p_to date` | totals + previous-period deltas |
| `analytics_breakdown` | `p_site, p_from, p_to, p_dimension text, p_limit int` | `(value, pageviews, visitors)` |
| `admin_create_org` | `p_name, p_slug, p_vertical, p_owner_email` | new org + invite (platform admin only) |
| `create_invite` | `p_org uuid, p_email text, p_role member_role` | `{ id, email, role, expires_at, token }` — `owner` only, raw token returned once |

All RPCs raise a Postgres exception with a `message` matching the codes in `#7.0`; `lib/supabase/errors.ts` maps `PostgrestError` → the same error shape so the UI has one code path.

Booking conflicts surface as `slot_taken` — the exclusion constraint throws `23P01`, the RPC catches it and re-raises cleanly. The frontend shows "ese horario ya se ocupó, elegí otro" and refetches availability. This *will* happen in normal use; treat it as a flow, not an error screen.

### 7.3 Everything else

Plain reads (list bookings, list customers, menu, settings) use `supabase.from(...)` in server components. No REST wrapper, no fetch layer, no react-query in v1. If a screen needs six queries, that's an RPC.

### 7.4 Internal routes

`/api/integrations/google/start` · `/callback` · `/api/cron/rollup` · `/api/cron/retention` (both cron routes require `Authorization: Bearer $CRON_SECRET`, called by Vercel Cron).

---

## 8. Auth flows

- **Login:** email + password (Supabase Auth), magic link as fallback, and **Entrar con Google**. Google is a sign-*in* only: `enable_signup = false` means an unknown Google account is rejected, not created. It reuses the same GCP OAuth client as the Calendar integration (`GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`), with the Supabase callback added to that client's authorised redirect URIs.
- **Signup is closed.** There is no public register page. Users exist because a platform admin created an org (`admin_create_org`) or an `owner` invited them.
- **Invite:** `owner` enters email + role → row in `invites` + email with a signed link → the invitee sets a password → `accept_invite` RPC creates the membership and marks the invite accepted. Invites expire in 7 days.
- **Session:** `@supabase/ssr` with cookies. Middleware refreshes the session and guards `/panel/*` and `/admin/*`.
- **Org resolution:** the URL carries `[orgSlug]`. A layout resolves slug → org and 404s if the user isn't a member. Never trust an `org_id` that arrives in a request body; derive it from the authenticated membership (public endpoints derive it from `site_key`).
- **Password reset:** stock Supabase flow, our own styled pages.

---

## 9. Google Calendar

**v1 is one-way: portal → Google.** A confirmed booking appears in the client's calendar. Edits made inside Google do not come back. We tell clients this out loud; two-way sync with watch channels is v2 and it is not a small feature.

- OAuth per org, started by an `owner` from settings. Scopes: `https://www.googleapis.com/auth/calendar.events` and `calendar.readonly`.
- **`google_calendar_connections`** — `id`, `org_id`, `resource_id uuid null` (null = one calendar for the whole org; set = one calendar per barber/coach), `google_email`, `calendar_id`, `refresh_token_secret_id uuid` (**Supabase Vault** — the raw refresh token is never a column), `scope`, `status text`, `last_error text`, `last_synced_at`, `created_at`. One connection per target: `create unique index on google_calendar_connections (org_id, coalesce(resource_id, org_id));`
- On booking `confirmed` → insert event, store `bookings.google_event_id`. On reschedule → patch. On cancel → delete. Failures are non-fatal: the booking still exists, `status` on the connection flips to `error`, a banner appears in settings.
- Sync runs out of band (a queue table `integration_jobs` drained by the cron route) so a slow Google API never blocks a booking.
- `freebusy` is read when computing availability **only if** the connection has `calendar.readonly` and the org enabled "bloquear horarios ocupados en Google" — otherwise availability is purely our own data.

---

## 10. Website statistics

### 10.1 Why first-party

We looked at three options.

1. **Vercel Web Analytics.** Free-ish, one line per site, zero backend. Rejected as the source of truth: the numbers live in Vercel's dashboard per project, pulling them into our portal means their API and their plan limits, and — the actual dealbreaker — they can't be joined with our own data. "83 people saw the menu page and 4 of them booked" is the only statistic a restaurant owner cares about, and it needs pageviews and bookings in the same database.
2. **Client sites writing straight into Supabase with the anon key.** Rejected: the key is public, there's no bot filtering, no geo, no rate limiting worth the name, and an insert policy open to anon is a table anyone can fill with garbage.
3. **First-party collector on the portal.** Chosen. We build every client site, so we control the snippet; the data lands in our Postgres next to bookings; there's nothing to pay for.

Vercel Web Analytics stays enabled on client projects as a free sanity check. It is never what the portal displays.

### 10.2 How it works

Every client site gets a rewrite so the beacon is **same-origin** — ad blockers ignore it, and there's no CORS preflight:

```js
// next.config.js on each client site
async rewrites() {
  return [{ source: '/z', destination: `${process.env.NEXT_PUBLIC_PORTAL_URL}/api/collect` }]
}
```

The snippet (shipped as `@zetro/track`, a ~1 KB internal package copied into the site template) fires on mount and on every App Router navigation:

```json
{ "k": "zs_ab12…", "t": "pv", "p": "/menu", "r": "https://google.com/", "w": 1440, "d": 12400 }
```

`k` site key, `t` type (`pv` | `ev`), `p` path (query string stripped except `utm_*`), `r` referrer, `w` viewport width, `d` ms on previous page. No cookies, no localStorage, no personal data.

`/api/collect` runs on the **edge runtime** and:

1. Looks up `k` → `site_id`, `org_id` (cached 5 min in memory; unknown key → `204`, silently).
2. Drops bots (UA regex + `sec-purpose: prefetch` + missing UA).
3. Reads `country` from `x-vercel-ip-country`, derives `device_type`/`browser` from the UA.
4. Computes `visitor_hash = sha256(daily_salt || site_id || ip || user_agent)` where `daily_salt = sha256(ANALYTICS_SALT || current_date)`. Rotating daily means yesterday's visitors can't be linked to today's — that's the point, and it also means "visitors" is a daily metric by construction.
5. `session_id = sha256(visitor_hash || 30-min bucket)`.
6. Inserts into `private.analytics_events` with the service role. Rate limit: 60 events/min per `visitor_hash`.
7. Returns `204` always. The collector never tells a caller anything.

### 10.3 Rollups

`private.rollup_analytics(day date)` recomputes `analytics_daily_totals` and `analytics_daily_breakdown` for that day (delete + insert, so it's idempotent). Bounce = a session with exactly one pageview.

Cron (`/api/cron/rollup`, Vercel Cron): every 15 min for today, and once at 03:10 for yesterday. `/api/cron/retention` runs weekly and deletes raw events older than 180 days.

Live view `public.analytics_live` (last 30 minutes, from raw) powers the "X personas ahora" tile. `private.analytics_events` has no read policy, so the view is a plain security-definer view whose own body carries `where private.is_member(org_id)` — that filter *is* the isolation, don't drop it and don't add `security_invoker`. It's the only place the dashboard touches raw events.

### 10.4 What the client actually sees

Visits, unique visitors and sessions with the previous-period delta; a daily line chart; top pages; top referrers; devices; countries; and the tile that matters — **pageviews on booking-related pages vs bookings created**, because that's the number that justifies the monthly fee.

---

## 11. Frontend

Backend ships this as a **scaffold**: every route exists, is typed, and reads real data through the contract above, with plain unstyled markup. Frontend owns everything that makes it look like a product. Backend does not push design decisions; frontend does not change queries, table names or endpoint shapes.

### 11.1 Route map

```
app/
  (marketing)/
    page.tsx                     landing: pitch, cómo funciona, precios (estáticos), CTA
    trabajos/page.tsx            examples grid, static data in content/works.ts for now
    trabajos/[slug]/page.tsx     case study
    contacto/page.tsx            → POST /api/public/leads
  (auth)/
    login/page.tsx
    invitacion/[token]/page.tsx
    recuperar/page.tsx
    auth/callback/route.ts
  panel/[orgSlug]/
    layout.tsx                   org guard + nav built from settings.modules
    page.tsx                     dashboard: dashboard_summary + live visitors
    reservas/page.tsx            calendar (day/week) + list, filters by status/resource
    reservas/nueva/page.tsx      create booking (availability → confirm)
    clientes/page.tsx            list + detail drawer, history
    analitica/page.tsx           analytics_overview + breakdowns + chart
    menu/page.tsx                restaurant|cafe only
    clases/page.tsx              gym only, group_sessions + registrations
    eventos/page.tsx
    pagos/page.tsx               read-only payment_records, "pendiente / pagado"
    ajustes/
      page.tsx                   org data, timezone, branding
      horarios/page.tsx          availability_rules + exceptions
      recursos/page.tsx          resources + services
      equipo/page.tsx            memberships + invites (owner only)
      integraciones/page.tsx     Google Calendar connect, site key, snippet to copy
  admin/
    page.tsx                     orgs list, status, last activity
    orgs/nueva/page.tsx          admin_create_org
    orgs/[id]/page.tsx           detail, sites, members, support view
    pagos/page.tsx               payment_records CRUD (the manual billing screen)
    leads/page.tsx               zetro.com leads
  api/…                          see #7
proxy.ts                         session refresh + /panel,/admin guards
```

### 11.2 Rules for the frontend

- `#4.1` applies here too — read it before opening an assistant. Especially the comment rule, the no-commit rule and stable versions only.
- Next.js (latest stable major — 16 at the time of writing, check before scaffolding), App Router, TypeScript strict, Tailwind, shadcn/ui. Server Components by default; `'use client'` only for something genuinely interactive.
- `params` and `searchParams` are async — `const { orgSlug } = await params`.
- Data: `lib/supabase/server.ts` in server components, server actions for mutations that call RPCs. No client-side Supabase writes.
- Types come from `supabase gen types typescript` → `lib/supabase/types.ts`, regenerated by backend after each migration and committed by Nicolás. Frontend imports from there and never hand-writes a row type.
- Dates: format with the org timezone, `Intl.DateTimeFormat('es-AR', { timeZone: org.timezone })`. Never a bare `toLocaleString()`.
- Money: `price_cents / 100` formatted `es-AR` with `currency`.
- Every list screen has three states written before the happy path: loading, empty (with the action that fixes it), error.
- Unknown enum value → render the raw string, never crash.
- Copy is Spanish (rioplatense, vos). No i18n library; strings live next to the component.
- No `localStorage` for anything that matters; the DB is the state.

### 11.3 Ownership split

| Area | Backend | Frontend |
|---|---|---|
| Migrations, RLS, RPCs, triggers | yes | never |
| `/api/*` route handlers | yes | never |
| Generated types | regenerates | consumes |
| Route scaffolds + data wiring | initial version | takes over after handoff |
| Components, styling, layout, UX | proposes nothing | yes |
| Landing copy and examples | placeholder | real |
| Charts | supplies rollup data | renders |
| Seed / demo data | yes | uses it |

---

## 12. Environment

**Portal (Vercel):**

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY          server only, never NEXT_PUBLIC_
SUPABASE_DB_URL                    local migrations only, not in Vercel
NEXT_PUBLIC_APP_URL
ANALYTICS_SALT                     32+ random chars, rotating it resets visitor identity
CRON_SECRET
GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / GOOGLE_REDIRECT_URI
RESEND_API_KEY                     invites + booking confirmations
```

**Each client site:**

```
NEXT_PUBLIC_ZETRO_SITE_KEY         sites.public_key
NEXT_PUBLIC_PORTAL_URL             https://app.zetro.com
```

Extensions to enable in Supabase: `pgcrypto`, `btree_gist`, `citext`, `pg_cron` (optional — Vercel Cron is the default), `supabase_vault`.

### 12.1 Toolchain

Pinned exactly in `package.json`, no carets. Two are deliberately **not** the latest release:

| Package | Pinned | Why not latest |
|---|---|---|
| `typescript` | 6.0.3 | `typescript-eslint` refuses to load under TS 7.0, which kills `npm run lint` on every file. |
| `eslint` | 9.39.5 | The `eslint-plugin-react` bundled inside `eslint-config-next@16.3.4` calls `context.getFilename()`, removed in ESLint 10. |

Everything else is latest stable: `next` 16.3.4, `react`/`react-dom` 19.2.8, `tailwindcss` + `@tailwindcss/postcss` 4.3.3, `@supabase/ssr` 0.12.5, `@supabase/supabase-js` 2.114.0, `zod` 4.5.4, `supabase` (CLI) 2.116.0.

Tailwind is v4, so there is no `tailwind.config.ts` — configuration is CSS-first in `app/globals.css`.

Revisit both pins when `eslint-config-next` ships a build that tolerates ESLint 10 and the TS 7 API.

---

## 13. Open questions

Nothing below blocks the backend from starting; each one has a default we run with until Nicolás says otherwise.

1. **Domain / URL layout.** Assumed `zetro.com` marketing and `app.zetro.com` portal in the same Next.js app, portal routes under `/panel/[orgSlug]`. Real domain TBD.
2. **Copy language.** Assumed Spanish (AR) hardcoded, English identifiers in code. Selling outside AR later turns this into an i18n ticket.
3. **Service past midnight.** A bar open 20:00–02:00 currently needs two rows and can't book 00:30. v1 accepts this; the fix is storing rules as minute offsets from midnight and allowing `closes_at < opens_at`.
4. **Booking confirmation emails.** Assumed Resend, one template, sent on confirm and cancel. Not built until phase 5.
5. **Who owns the client's site content** (the menu shown on their public website) — assumed the public site fetches it from a portal endpoint that does not exist yet. If we want it, it's `GET /api/public/menu`. Flagged, not built.
6. **Plan tiers.** No `plans` table in v1 since there's no billing. `payment_records.amount_cents` is typed in by hand each month.
7. **Photo storage.** Assumed Supabase Storage buckets `logos/` and `menu/`, public read, upload restricted to `owner`/`manager` by storage policies. Not specced in detail here.

---

## 14. Changelog

| Version | Date | Change |
|---|---|---|
| 0.1 | 2026-09-02 | First contract. Multi-tenant single app, booking core shared across the four verticals, first-party analytics, no billing, shared code habits in `#4.1`. |
| 0.2 | 2026-09-02 | Phase 0. `middleware.ts` renamed to `proxy.ts` (Next 16 deprecated the middleware convention; the exported function is now `proxy` and it always runs on the Node runtime). Postgres pinned to 17. Toolchain pins in `#12`. |
| 0.3 | 2026-09-03 | Google sign-in added to `/login`, reversing the "no social login in v1" line in `#8`. Sign-in only — signups stay closed, so Google cannot create an account. `create_invite(p_org, p_email, p_role)` added to `#7.2`. |
