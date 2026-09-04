create or replace function public.get_availability(
  p_org uuid,
  p_service uuid,
  p_from date,
  p_to date,
  p_party_size int default 1
) returns table (starts_at timestamptz, ends_at timestamptz, resource_id uuid, resource_name text)
language plpgsql stable security invoker set search_path = '' as $$
declare
  v_tz text;
  v_booking jsonb;
  v_party int := coalesce(p_party_size, 1);
  v_slot int;
  v_duration int;
  v_before int;
  v_after int;
  v_restricted boolean;
  v_min timestamptz;
  v_max timestamptz;
begin
  if p_from is null or p_to is null or p_to < p_from or p_to - p_from > 30 or v_party < 1 then
    raise exception 'validation_failed';
  end if;

  select o.timezone, (private.default_org_settings() -> 'booking') || coalesce(o.settings -> 'booking', '{}'::jsonb)
    into v_tz, v_booking
    from public.orgs o
   where o.id = p_org;

  if v_tz is null then
    raise exception 'not_found';
  end if;

  select s.duration_minutes, s.buffer_before_minutes, s.buffer_after_minutes
    into v_duration, v_before, v_after
    from public.services s
   where s.id = p_service and s.org_id = p_org and s.is_active and s.archived_at is null;

  if v_duration is null then
    raise exception 'not_found';
  end if;

  if v_party > (v_booking ->> 'max_party_size')::int then
    raise exception 'validation_failed';
  end if;

  v_slot := (v_booking ->> 'slot_minutes')::int;
  v_min := now() + make_interval(mins => (v_booking ->> 'lead_time_minutes')::int);
  v_max := now() + make_interval(days => (v_booking ->> 'max_days_ahead')::int);
  v_restricted := exists (select 1 from public.service_resources sr where sr.service_id = p_service);

  return query
  with days as (
    select d::date as day
      from generate_series(p_from, p_to, interval '1 day') d
  ),
  res as (
    select r.id, r.name, r.sort_order
      from public.resources r
     where r.org_id = p_org
       and r.is_active
       and r.archived_at is null
       and r.capacity >= v_party
       and (not v_restricted
            or exists (select 1 from public.service_resources sr
                        where sr.service_id = p_service and sr.resource_id = r.id))
  ),
  own_rules as (
    select distinct a.resource_id
      from public.availability_rules a
     where a.org_id = p_org and a.resource_id is not null
  ),
  exceptions as (
    select r.id as res_id, d.day, x.is_closed, x.opens_at, x.closes_at
      from res r
      cross join days d
      join lateral (
        select e.is_closed, e.opens_at, e.closes_at
          from public.availability_exceptions e
         where e.org_id = p_org
           and e.date = d.day
           and (e.resource_id = r.id or e.resource_id is null)
         order by e.resource_id nulls last
         limit 1
      ) x on true
  ),
  spans as (
    select x.res_id, x.day, x.opens_at, x.closes_at
      from exceptions x
     where not x.is_closed
    union all
    select r.id, d.day, a.opens_at, a.closes_at
      from res r
      cross join days d
      join public.availability_rules a
        on a.org_id = p_org
       and a.weekday = extract(dow from d.day)::smallint
       and (case when r.id in (select o.resource_id from own_rules o)
                 then a.resource_id = r.id
                 else a.resource_id is null end)
     where not exists (select 1 from exceptions x where x.res_id = r.id and x.day = d.day)
  ),
  grid as (
    select s.res_id, g.t as local_start
      from spans s
      cross join lateral generate_series(
        s.day + s.opens_at,
        s.day + s.closes_at - make_interval(mins => v_duration),
        make_interval(mins => v_slot)
      ) g(t)
  ),
  candidates as (
    select distinct
           (g.local_start at time zone v_tz) as slot_start,
           (g.local_start at time zone v_tz) + make_interval(mins => v_duration) as slot_end,
           r.id as res_id,
           r.name,
           r.sort_order
      from grid g
      join res r on r.id = g.res_id
  )
  select c.slot_start, c.slot_end, c.res_id, c.name
    from candidates c
   where c.slot_start >= v_min
     and c.slot_start <= v_max
     and not exists (
       select 1
         from public.bookings b
        where b.resource_id = c.res_id
          and b.status not in ('cancelled','no_show')
          and b.blocked_range && tstzrange(c.slot_start - make_interval(mins => v_before),
                                           c.slot_end + make_interval(mins => v_after), '[)')
     )
   order by c.slot_start, c.sort_order, c.name;
end;
$$;

revoke execute on function public.get_availability(uuid, uuid, date, date, int) from public, anon;
grant execute on function public.get_availability(uuid, uuid, date, date, int) to authenticated;
grant execute on function public.get_availability(uuid, uuid, date, date, int) to service_role;

create or replace function public.create_booking(
  p_org uuid,
  p_resource uuid,
  p_service uuid,
  p_starts_at timestamptz,
  p_party_size int default 1,
  p_customer jsonb default null,
  p_notes text default null
) returns public.bookings
language plpgsql security invoker set search_path = '' as $$
declare
  v_staff boolean := auth.uid() is not null;
  v_tz text;
  v_booking jsonb;
  v_service public.services;
  v_capacity int;
  v_party int := coalesce(p_party_size, 1);
  v_name text;
  v_email text;
  v_phone text;
  v_customer uuid;
  v_ends_at timestamptz;
  v_status public.booking_status;
  v_source public.booking_source;
  v_row public.bookings;
begin
  if v_staff and not private.has_role(p_org, array['owner','manager','staff']::public.member_role[]) then
    raise exception 'forbidden';
  end if;

  select o.timezone, (private.default_org_settings() -> 'booking') || coalesce(o.settings -> 'booking', '{}'::jsonb)
    into v_tz, v_booking
    from public.orgs o
   where o.id = p_org;

  if v_tz is null then
    raise exception 'not_found';
  end if;

  select * into v_service
    from public.services s
   where s.id = p_service and s.org_id = p_org and s.is_active and s.archived_at is null;

  if v_service.id is null then
    raise exception 'not_found';
  end if;

  select r.capacity into v_capacity
    from public.resources r
   where r.id = p_resource and r.org_id = p_org and r.is_active and r.archived_at is null;

  if v_capacity is null then
    raise exception 'not_found';
  end if;

  if p_starts_at is null or v_party < 1 or v_party > (v_booking ->> 'max_party_size')::int then
    raise exception 'validation_failed';
  end if;

  if v_party > v_capacity then
    raise exception 'capacity_full';
  end if;

  if exists (select 1 from public.service_resources sr where sr.service_id = p_service)
     and not exists (select 1 from public.service_resources sr
                      where sr.service_id = p_service and sr.resource_id = p_resource) then
    raise exception 'validation_failed';
  end if;

  v_name := nullif(btrim(p_customer ->> 'full_name'), '');
  v_email := nullif(btrim(p_customer ->> 'email'), '');
  v_phone := nullif(btrim(p_customer ->> 'phone'), '');
  v_ends_at := p_starts_at + make_interval(mins => v_service.duration_minutes);

  -- the booking window is a public-widget rule, staff take walk-ins and long-lead parties
  if not v_staff then
    if p_starts_at < now() + make_interval(mins => (v_booking ->> 'lead_time_minutes')::int)
       or p_starts_at > now() + make_interval(days => (v_booking ->> 'max_days_ahead')::int)
       or v_name is null
       or ((v_booking ->> 'require_phone')::boolean and v_phone is null) then
      raise exception 'validation_failed';
    end if;

    if not exists (
      select 1
        from public.get_availability(p_org, p_service,
                                     (p_starts_at at time zone v_tz)::date,
                                     (p_starts_at at time zone v_tz)::date,
                                     v_party) a
       where a.starts_at = p_starts_at and a.resource_id = p_resource
    ) then
      if exists (
        select 1 from public.bookings b
         where b.resource_id = p_resource
           and b.status not in ('cancelled','no_show')
           and b.blocked_range && tstzrange(p_starts_at - make_interval(mins => v_service.buffer_before_minutes),
                                            v_ends_at + make_interval(mins => v_service.buffer_after_minutes), '[)')
      ) then
        raise exception 'slot_taken';
      end if;
      raise exception 'validation_failed';
    end if;
  end if;

  if v_name is not null and v_email is not null then
    insert into public.customers (org_id, full_name, email, phone)
    values (p_org, v_name, v_email::extensions.citext, v_phone)
    on conflict (org_id, lower(email)) where email is not null
    do update set full_name = excluded.full_name,
                  phone = coalesce(excluded.phone, customers.phone)
    returning id into v_customer;
  elsif v_name is not null and v_phone is not null then
    insert into public.customers (org_id, full_name, phone)
    values (p_org, v_name, v_phone)
    on conflict (org_id, phone) where phone is not null
    do update set full_name = excluded.full_name
    returning id into v_customer;
  end if;

  if v_staff then
    v_status := 'confirmed';
    v_source := 'portal';
  else
    v_status := case when (v_booking ->> 'auto_confirm')::boolean then 'confirmed' else 'pending' end;
    v_source := 'public_site';
  end if;

  begin
    insert into public.bookings (org_id, resource_id, service_id, customer_id, starts_at, ends_at,
                                 buffer_before_minutes, buffer_after_minutes, party_size,
                                 status, source, notes, created_by)
    values (p_org, p_resource, p_service, v_customer, p_starts_at, v_ends_at,
            v_service.buffer_before_minutes, v_service.buffer_after_minutes, v_party,
            v_status, v_source, nullif(btrim(p_notes), ''), auth.uid())
    returning * into v_row;
  exception when exclusion_violation then
    raise exception 'slot_taken';
  end;

  return v_row;
end;
$$;

revoke execute on function public.create_booking(uuid, uuid, uuid, timestamptz, int, jsonb, text) from public, anon;
grant execute on function public.create_booking(uuid, uuid, uuid, timestamptz, int, jsonb, text) to authenticated;
grant execute on function public.create_booking(uuid, uuid, uuid, timestamptz, int, jsonb, text) to service_role;

create or replace function public.reschedule_booking(
  p_booking uuid,
  p_starts_at timestamptz,
  p_resource uuid default null
) returns public.bookings
language plpgsql security invoker set search_path = '' as $$
declare
  v_old public.bookings;
  v_resource uuid;
  v_capacity int;
  v_row public.bookings;
begin
  select * into v_old from public.bookings b where b.id = p_booking;

  if v_old.id is null then
    raise exception 'not_found';
  end if;

  if auth.uid() is not null
     and not private.has_role(v_old.org_id, array['owner','manager','staff']::public.member_role[]) then
    raise exception 'forbidden';
  end if;

  if p_starts_at is null or v_old.status in ('cancelled','no_show','completed') then
    raise exception 'validation_failed';
  end if;

  v_resource := coalesce(p_resource, v_old.resource_id);

  select r.capacity into v_capacity
    from public.resources r
   where r.id = v_resource and r.org_id = v_old.org_id and r.is_active and r.archived_at is null;

  if v_capacity is null then
    raise exception 'not_found';
  end if;

  if v_old.party_size > v_capacity then
    raise exception 'capacity_full';
  end if;

  if v_old.service_id is not null
     and exists (select 1 from public.service_resources sr where sr.service_id = v_old.service_id)
     and not exists (select 1 from public.service_resources sr
                      where sr.service_id = v_old.service_id and sr.resource_id = v_resource) then
    raise exception 'validation_failed';
  end if;

  begin
    -- keep the duration the booking was made with, the service may have been edited since
    update public.bookings b
       set starts_at = p_starts_at,
           ends_at = p_starts_at + (v_old.ends_at - v_old.starts_at),
           resource_id = v_resource
     where b.id = p_booking
    returning * into v_row;
  exception when exclusion_violation then
    raise exception 'slot_taken';
  end;

  return v_row;
end;
$$;

revoke execute on function public.reschedule_booking(uuid, timestamptz, uuid) from public, anon;
grant execute on function public.reschedule_booking(uuid, timestamptz, uuid) to authenticated;

create or replace function public.set_booking_status(
  p_booking uuid,
  p_status public.booking_status,
  p_reason text default null
) returns public.bookings
language plpgsql security invoker set search_path = '' as $$
declare
  v_old public.bookings;
  v_row public.bookings;
begin
  select * into v_old from public.bookings b where b.id = p_booking;

  if v_old.id is null then
    raise exception 'not_found';
  end if;

  if auth.uid() is not null
     and not private.has_role(v_old.org_id, array['owner','manager','staff']::public.member_role[]) then
    raise exception 'forbidden';
  end if;

  if p_status is null then
    raise exception 'validation_failed';
  end if;

  if p_status = v_old.status then
    return v_old;
  end if;

  begin
    update public.bookings b
       set status = p_status,
           cancelled_at = case when p_status = 'cancelled' then now() end,
           cancellation_reason = case when p_status = 'cancelled' then nullif(btrim(p_reason), '') end
     where b.id = p_booking
    returning * into v_row;
  exception when exclusion_violation then
    raise exception 'slot_taken';
  end;

  return v_row;
end;
$$;

revoke execute on function public.set_booking_status(uuid, public.booking_status, text) from public, anon;
grant execute on function public.set_booking_status(uuid, public.booking_status, text) to authenticated;
