create table public.leads (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references public.orgs(id) on delete cascade,
  site_id uuid references public.sites(id) on delete set null,
  name text not null,
  email extensions.citext not null,
  phone text,
  message text not null,
  meta jsonb not null default '{}'::jsonb,
  source_path text,
  status public.lead_status not null default 'new',
  created_at timestamptz not null default now()
);

create index leads_org_created_at_idx on public.leads (org_id, created_at desc);
create index leads_zetro_created_at_idx on public.leads (created_at desc) where org_id is null;

alter table public.leads enable row level security;

create policy leads_select on public.leads
  for select using (
    case when org_id is null then private.is_platform_admin() else private.is_member(org_id) end
  );

create policy leads_update on public.leads
  for update using (
    case when org_id is null then private.is_platform_admin()
         else private.has_role(org_id, array['owner','manager']::public.member_role[]) end
  ) with check (
    case when org_id is null then private.is_platform_admin()
         else private.has_role(org_id, array['owner','manager']::public.member_role[]) end
  );

-- owner and manager move a lead through the funnel, they don't rewrite what it said
create or replace function private.guard_lead_fields()
returns trigger language plpgsql set search_path = '' as $$
begin
  if auth.uid() is null or private.is_platform_admin() then return new; end if;

  if new.org_id is distinct from old.org_id
     or new.site_id is distinct from old.site_id
     or new.name is distinct from old.name
     or new.email is distinct from old.email
     or new.phone is distinct from old.phone
     or new.message is distinct from old.message
     or new.meta is distinct from old.meta
     or new.source_path is distinct from old.source_path
     or new.created_at is distinct from old.created_at then
    raise exception 'forbidden';
  end if;

  return new;
end;
$$;

create trigger leads_guard_fields
  before update on public.leads
  for each row execute function private.guard_lead_fields();

create table private.rate_limits (
  bucket text primary key,
  hits integer not null default 0,
  window_start timestamptz not null default now()
);

create or replace function public.check_rate_limit(p_bucket text, p_limit int, p_window_seconds int)
returns boolean language plpgsql security definer set search_path = '' as $$
declare
  v_hits int;
  v_window interval := make_interval(secs => p_window_seconds);
begin
  insert into private.rate_limits (bucket, hits, window_start)
  values (p_bucket, 1, now())
  on conflict (bucket) do update
     set hits = case when rate_limits.window_start < now() - v_window then 1 else rate_limits.hits + 1 end,
         window_start = case when rate_limits.window_start < now() - v_window then now() else rate_limits.window_start end
  returning hits into v_hits;

  return v_hits <= p_limit;
end;
$$;

revoke execute on function public.check_rate_limit(text, int, int) from public, anon, authenticated;
grant execute on function public.check_rate_limit(text, int, int) to service_role;
