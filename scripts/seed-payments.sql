-- dev rows for the pagos screen, for a project the seed file never runs against.
-- paste into the supabase sql editor. safe to run twice, an existing month is left alone.
--
-- set both lines in `params` first. these rows show up in /panel/<slug>/pagos for that
-- org's owner, so don't point it at a real client unless the amount is what they really pay.
-- it refuses to touch anything if `slugs` is empty.

with params as (
  select array[]::text[] as slugs,
         0::int as amount_cents
),
admin as (
  select p.id from public.profiles p where p.is_platform_admin order by p.created_at limit 1
),
target as (
  select o.id, o.currency, o.timezone
    from public.orgs o, params
   where o.slug = any(params.slugs)
),
months as (
  select t.id, t.currency, t.timezone, g,
         (date_trunc('month', now() at time zone t.timezone) - make_interval(months => g))::date as period
    from target t
    cross join generate_series(0, 5) g
)
insert into public.payment_records (org_id, period_month, amount_cents, currency, status,
                                    due_date, paid_at, method, recorded_by)
select m.id,
       m.period,
       (select amount_cents from params),
       m.currency,
       s.status,
       m.period + 9,
       case when s.status = 'paid' then (m.period + 7)::timestamp at time zone m.timezone end,
       case when s.status = 'paid' then 'transferencia' end,
       (select id from admin)
from months m
cross join lateral (
  select case when m.g = 0 then 'pending'::public.payment_status
              else 'paid'::public.payment_status end as status
) s
on conflict (org_id, period_month) do nothing;
