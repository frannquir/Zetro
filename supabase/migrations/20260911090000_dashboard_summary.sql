create or replace function public.dashboard_summary(
  p_org uuid,
  p_from date,
  p_to date
) returns table (
  bookings_today int,
  bookings_next_7 int,
  cancellations int,
  new_customers int,
  occupancy numeric,
  bookings_delta numeric,
  customers_delta numeric,
  pageviews int,
  pageviews_delta numeric,
  top_path text,
  live_visitors int
)
language plpgsql stable security invoker set search_path = '' as $$
declare
  v_tz text;
  v_today date;
  v_len int;
  v_from timestamptz;
  v_to timestamptz;
  v_prev_from timestamptz;
  v_today_from timestamptz;
  v_today_to timestamptz;
  v_week_to timestamptz;
  v_booked numeric;
  v_open numeric;
  v_bookings int;
  v_prev_bookings int;
  v_customers int;
  v_prev_customers int;
  v_today_count int;
  v_next_7 int;
  v_cancelled int;
begin
  if auth.uid() is not null and not private.is_member(p_org) then
    raise exception 'forbidden';
  end if;

  select o.timezone into v_tz from public.orgs o where o.id = p_org;

  if v_tz is null then
    raise exception 'not_found';
  end if;

  if p_from is null or p_to is null or p_to < p_from or p_to - p_from > 366 then
    raise exception 'validation_failed';
  end if;

  v_today := (now() at time zone v_tz)::date;
  v_len := p_to - p_from + 1;
  v_from := (p_from::timestamp) at time zone v_tz;
  v_to := ((p_to + 1)::timestamp) at time zone v_tz;
  v_prev_from := ((p_from - v_len)::timestamp) at time zone v_tz;
  v_today_from := (v_today::timestamp) at time zone v_tz;
  v_today_to := ((v_today + 1)::timestamp) at time zone v_tz;
  v_week_to := ((v_today + 8)::timestamp) at time zone v_tz;

  select count(*) filter (where b.starts_at >= v_today_from and b.starts_at < v_today_to
                            and b.status not in ('cancelled','no_show')),
         count(*) filter (where b.starts_at >= v_today_to and b.starts_at < v_week_to
                            and b.status not in ('cancelled','no_show')),
         -- every count here is keyed on starts_at, so this is "of the bookings in the window, how many fell through"
         count(*) filter (where b.starts_at >= v_from and b.starts_at < v_to
                            and b.status = 'cancelled'),
         count(*) filter (where b.starts_at >= v_from and b.starts_at < v_to
                            and b.status not in ('cancelled','no_show')),
         count(*) filter (where b.starts_at >= v_prev_from and b.starts_at < v_from
                            and b.status not in ('cancelled','no_show')),
         coalesce(sum(extract(epoch from (b.ends_at - b.starts_at)) / 60)
                  filter (where b.starts_at >= v_from and b.starts_at < v_to
                            and b.status not in ('cancelled','no_show')), 0)
    into v_today_count, v_next_7, v_cancelled, v_bookings, v_prev_bookings, v_booked
    from public.bookings b
   where b.org_id = p_org
     and b.starts_at >= least(v_prev_from, v_today_from)
     and b.starts_at < greatest(v_to, v_week_to);

  select count(*) filter (where c.created_at >= v_from and c.created_at < v_to),
         count(*) filter (where c.created_at >= v_prev_from and c.created_at < v_from)
    into v_customers, v_prev_customers
    from public.customers c
   where c.org_id = p_org
     and c.created_at >= v_prev_from
     and c.created_at < v_to;

  with days as (
    select d::date as day
      from generate_series(p_from, p_to, interval '1 day') d
  ),
  res as (
    select r.id
      from public.resources r
     where r.org_id = p_org and r.is_active and r.archived_at is null
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
    select x.opens_at, x.closes_at
      from exceptions x
     where not x.is_closed
    union all
    select a.opens_at, a.closes_at
      from res r
      cross join days d
      join public.availability_rules a
        on a.org_id = p_org
       and a.weekday = extract(dow from d.day)::smallint
       and (case when r.id in (select o.resource_id from own_rules o)
                 then a.resource_id = r.id
                 else a.resource_id is null end)
     where not exists (select 1 from exceptions x where x.res_id = r.id and x.day = d.day)
  )
  select coalesce(sum(extract(epoch from (s.closes_at - s.opens_at)) / 60), 0)
    into v_open
    from spans s;

  return query
  select v_today_count,
         v_next_7,
         v_cancelled,
         v_customers,
         case when v_open > 0 then round(v_booked / v_open, 4) end,
         case when v_prev_bookings > 0
              then round((v_bookings - v_prev_bookings)::numeric / v_prev_bookings, 4) end,
         case when v_prev_customers > 0
              then round((v_customers - v_prev_customers)::numeric / v_prev_customers, 4) end,
         null::int,
         null::numeric,
         null::text,
         null::int;
end;
$$;

revoke execute on function public.dashboard_summary(uuid, date, date) from public, anon;
grant execute on function public.dashboard_summary(uuid, date, date) to authenticated;
grant execute on function public.dashboard_summary(uuid, date, date) to service_role;
