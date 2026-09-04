create table public.resources (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  name text not null,
  kind public.resource_kind not null,
  capacity integer not null default 1 check (capacity > 0),
  user_id uuid references public.profiles(id) on delete set null,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  unique (org_id, id)
);

create index resources_user_id_idx on public.resources (user_id) where user_id is not null;

create table public.services (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  name text not null,
  description text,
  duration_minutes integer not null check (duration_minutes > 0),
  buffer_before_minutes integer not null default 0 check (buffer_before_minutes >= 0),
  buffer_after_minutes integer not null default 0 check (buffer_after_minutes >= 0),
  price_cents integer check (price_cents >= 0),
  currency char(3),
  is_public boolean not null default true,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  unique (org_id, id)
);

create table public.service_resources (
  org_id uuid not null references public.orgs(id) on delete cascade,
  service_id uuid not null,
  resource_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (service_id, resource_id),
  foreign key (org_id, service_id) references public.services (org_id, id) on delete cascade,
  foreign key (org_id, resource_id) references public.resources (org_id, id) on delete cascade
);

create index service_resources_org_id_idx on public.service_resources (org_id);
create index service_resources_resource_id_idx on public.service_resources (resource_id);

create table public.availability_rules (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  resource_id uuid,
  weekday smallint not null check (weekday between 0 and 6),
  opens_at time not null,
  closes_at time not null,
  created_at timestamptz not null default now(),
  check (closes_at > opens_at),
  foreign key (org_id, resource_id) references public.resources (org_id, id) on delete cascade
);

create index availability_rules_org_weekday_idx on public.availability_rules (org_id, weekday);

create table public.availability_exceptions (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  resource_id uuid,
  date date not null,
  is_closed boolean not null default true,
  opens_at time,
  closes_at time,
  note text,
  created_at timestamptz not null default now(),
  check (is_closed or (opens_at is not null and closes_at is not null and closes_at > opens_at)),
  foreign key (org_id, resource_id) references public.resources (org_id, id) on delete cascade
);

-- one winning row per scope, otherwise precedence is a coin flip
create unique index availability_exceptions_org_date_idx
  on public.availability_exceptions (org_id, date) where resource_id is null;
create unique index availability_exceptions_resource_date_idx
  on public.availability_exceptions (org_id, resource_id, date) where resource_id is not null;

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  full_name text not null,
  email extensions.citext,
  phone text,
  notes text,
  marketing_opt_in boolean not null default false,
  visits_count integer not null default 0,
  last_visit_at timestamptz,
  created_at timestamptz not null default now(),
  unique (org_id, id)
);

create unique index customers_org_email_idx on public.customers (org_id, lower(email)) where email is not null;
create unique index customers_org_phone_idx on public.customers (org_id, phone) where phone is not null;

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  resource_id uuid not null,
  service_id uuid,
  customer_id uuid,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  buffer_before_minutes integer not null default 0 check (buffer_before_minutes >= 0),
  buffer_after_minutes integer not null default 0 check (buffer_after_minutes >= 0),
  blocked_range tstzrange not null,
  party_size integer not null default 1 check (party_size > 0),
  status public.booking_status not null default 'pending',
  source public.booking_source not null default 'portal',
  notes text,
  internal_notes text,
  google_event_id text,
  created_by uuid references public.profiles(id) on delete set null,
  cancelled_at timestamptz,
  cancellation_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  check (ends_at > starts_at),
  foreign key (org_id, resource_id) references public.resources (org_id, id),
  foreign key (org_id, service_id) references public.services (org_id, id),
  foreign key (org_id, customer_id) references public.customers (org_id, id) on delete set null (customer_id)
);

-- gist needs btree_gist for the = on resource_id
alter table public.bookings add constraint bookings_no_overlap
  exclude using gist (resource_id with =, blocked_range with &&)
  where (status not in ('cancelled','no_show'));

create index bookings_org_starts_at_idx on public.bookings (org_id, starts_at desc);
create index bookings_org_status_idx on public.bookings (org_id, status);
create index bookings_customer_id_idx on public.bookings (customer_id);

create table public.booking_events (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  org_id uuid not null references public.orgs(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  from_status public.booking_status,
  to_status public.booking_status not null,
  meta jsonb not null default '{}'::jsonb,
  at timestamptz not null default now()
);

create index booking_events_booking_id_idx on public.booking_events (booking_id, at desc);
create index booking_events_org_id_idx on public.booking_events (org_id, at desc);

-- timestamptz +- interval is stable, not immutable, so this can't be a generated column
create or replace function private.set_blocked_range()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.blocked_range := tstzrange(
    new.starts_at - make_interval(mins => new.buffer_before_minutes),
    new.ends_at   + make_interval(mins => new.buffer_after_minutes),
    '[)');
  return new;
end;
$$;

create trigger bookings_set_blocked_range
  before insert or update on public.bookings
  for each row execute function private.set_blocked_range();

create trigger bookings_set_updated_at
  before update on public.bookings
  for each row execute function private.set_updated_at();

-- definer: booking_events has no write policy, this trigger is its only writer
create or replace function private.log_booking_event()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    insert into public.booking_events (booking_id, org_id, actor_id, from_status, to_status, meta)
    values (new.id, new.org_id, auth.uid(), null, new.status,
            jsonb_build_object('event', 'created', 'source', new.source));
  else
    if new.status is distinct from old.status then
      insert into public.booking_events (booking_id, org_id, actor_id, from_status, to_status, meta)
      values (new.id, new.org_id, auth.uid(), old.status, new.status,
              jsonb_strip_nulls(jsonb_build_object('event', 'status', 'reason', new.cancellation_reason)));
    end if;

    if new.starts_at is distinct from old.starts_at or new.resource_id is distinct from old.resource_id then
      insert into public.booking_events (booking_id, org_id, actor_id, from_status, to_status, meta)
      values (new.id, new.org_id, auth.uid(), old.status, new.status,
              jsonb_build_object('event', 'rescheduled',
                                 'from_starts_at', old.starts_at, 'to_starts_at', new.starts_at,
                                 'from_resource_id', old.resource_id, 'to_resource_id', new.resource_id));
    end if;
  end if;

  if new.customer_id is not null and new.status = 'completed'
     and (tg_op = 'INSERT' or old.status is distinct from 'completed') then
    update public.customers
       set visits_count = visits_count + 1,
           last_visit_at = greatest(last_visit_at, new.starts_at)
     where id = new.customer_id;
  end if;

  return null;
end;
$$;

create trigger bookings_log_event
  after insert or update on public.bookings
  for each row execute function private.log_booking_event();

alter table public.resources enable row level security;
alter table public.services enable row level security;
alter table public.service_resources enable row level security;
alter table public.availability_rules enable row level security;
alter table public.availability_exceptions enable row level security;
alter table public.customers enable row level security;
alter table public.bookings enable row level security;
alter table public.booking_events enable row level security;

create policy resources_select on public.resources
  for select using (private.is_member(org_id));

create policy resources_write on public.resources
  for all using (private.has_role(org_id, array['owner','manager']::public.member_role[]))
      with check (private.has_role(org_id, array['owner','manager']::public.member_role[]));

create policy services_select on public.services
  for select using (private.is_member(org_id));

create policy services_write on public.services
  for all using (private.has_role(org_id, array['owner','manager']::public.member_role[]))
      with check (private.has_role(org_id, array['owner','manager']::public.member_role[]));

create policy service_resources_select on public.service_resources
  for select using (private.is_member(org_id));

create policy service_resources_write on public.service_resources
  for all using (private.has_role(org_id, array['owner','manager']::public.member_role[]))
      with check (private.has_role(org_id, array['owner','manager']::public.member_role[]));

create policy availability_rules_select on public.availability_rules
  for select using (private.is_member(org_id));

create policy availability_rules_write on public.availability_rules
  for all using (private.has_role(org_id, array['owner','manager']::public.member_role[]))
      with check (private.has_role(org_id, array['owner','manager']::public.member_role[]));

create policy availability_exceptions_select on public.availability_exceptions
  for select using (private.is_member(org_id));

create policy availability_exceptions_write on public.availability_exceptions
  for all using (private.has_role(org_id, array['owner','manager']::public.member_role[]))
      with check (private.has_role(org_id, array['owner','manager']::public.member_role[]));

create policy customers_select on public.customers
  for select using (private.is_member(org_id));

create policy customers_write on public.customers
  for all using (private.has_role(org_id, array['owner','manager','staff']::public.member_role[]))
      with check (private.has_role(org_id, array['owner','manager','staff']::public.member_role[]));

create policy bookings_select on public.bookings
  for select using (private.is_member(org_id));

create policy bookings_write on public.bookings
  for all using (private.has_role(org_id, array['owner','manager','staff']::public.member_role[]))
      with check (private.has_role(org_id, array['owner','manager','staff']::public.member_role[]));

create policy booking_events_select on public.booking_events
  for select using (private.is_member(org_id));
