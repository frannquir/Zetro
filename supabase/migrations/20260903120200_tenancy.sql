create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  avatar_url text,
  is_platform_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.orgs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  vertical public.vertical_type not null,
  status public.org_status not null default 'trial',
  timezone text not null default 'America/Argentina/Buenos_Aires',
  currency char(3) not null default 'ARS',
  logo_url text,
  phone text,
  address text,
  whatsapp text,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create table public.sites (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  name text not null default 'sitio principal',
  domain text not null,
  public_key text not null unique default private.new_site_key(),
  vercel_project_id text,
  status text not null default 'live' check (status in ('live','building','paused')),
  created_at timestamptz not null default now()
);

create index sites_org_id_idx on public.sites (org_id);

create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.member_role not null,
  created_at timestamptz not null default now(),
  unique (org_id, user_id)
);

create index memberships_user_id_idx on public.memberships (user_id);

create table public.invites (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  email extensions.citext not null,
  role public.member_role not null,
  token_hash text not null unique,
  expires_at timestamptz not null,
  accepted_at timestamptz,
  invited_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index invites_org_id_idx on public.invites (org_id);
create unique index invites_pending_email_idx on public.invites (org_id, email) where accepted_at is null;

create trigger orgs_set_updated_at
  before update on public.orgs
  for each row execute function private.set_updated_at();

create or replace function private.guard_org_admin_fields()
returns trigger language plpgsql set search_path = '' as $$
begin
  -- no jwt means seed or service role, both trusted
  if auth.uid() is null then return new; end if;

  if (new.slug is distinct from old.slug or new.status is distinct from old.status)
     and not private.is_platform_admin() then
    raise exception 'forbidden';
  end if;

  return new;
end;
$$;

create trigger orgs_guard_admin_fields
  before update on public.orgs
  for each row execute function private.guard_org_admin_fields();

create or replace function private.guard_profile_admin_flag()
returns trigger language plpgsql set search_path = '' as $$
begin
  if auth.uid() is null then return new; end if;

  if new.is_platform_admin is distinct from old.is_platform_admin
     and not private.is_platform_admin() then
    raise exception 'forbidden';
  end if;

  return new;
end;
$$;

create trigger profiles_guard_admin_flag
  before update on public.profiles
  for each row execute function private.guard_profile_admin_flag();

alter table public.profiles enable row level security;
alter table public.orgs enable row level security;
alter table public.sites enable row level security;
alter table public.memberships enable row level security;
alter table public.invites enable row level security;

create policy profiles_select on public.profiles
  for select using (private.shares_org(id));

create policy profiles_update on public.profiles
  for update using (id = auth.uid() or private.is_platform_admin())
       with check (id = auth.uid() or private.is_platform_admin());

create policy orgs_select on public.orgs
  for select using (private.is_member(id));

create policy orgs_insert on public.orgs
  for insert with check (private.is_platform_admin());

create policy orgs_update on public.orgs
  for update using (private.has_role(id, array['owner']::public.member_role[]))
       with check (private.has_role(id, array['owner']::public.member_role[]));

create policy orgs_delete on public.orgs
  for delete using (private.is_platform_admin());

create policy sites_select on public.sites
  for select using (private.is_member(org_id));

create policy sites_write on public.sites
  for all using (private.is_platform_admin())
      with check (private.is_platform_admin());

create policy memberships_select on public.memberships
  for select using (private.is_member(org_id));

create policy memberships_write on public.memberships
  for all using (private.has_role(org_id, array['owner']::public.member_role[]))
      with check (private.has_role(org_id, array['owner']::public.member_role[]));

create policy invites_select on public.invites
  for select using (private.is_member(org_id));

create policy invites_write on public.invites
  for all using (private.has_role(org_id, array['owner']::public.member_role[]))
      with check (private.has_role(org_id, array['owner']::public.member_role[]));
