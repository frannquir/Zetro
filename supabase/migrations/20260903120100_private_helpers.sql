-- helpers reference tables created in the next migration
set check_function_bodies = off;

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

create or replace function private.shares_org(target_user uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select private.is_platform_admin()
      or target_user = auth.uid()
      or exists (select 1 from public.memberships mine
                 join public.memberships theirs on theirs.org_id = mine.org_id
                 where mine.user_id = auth.uid() and theirs.user_id = target_user);
$$;

create or replace function private.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function private.new_token()
returns text language sql volatile set search_path = '' as $$
  select replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '');
$$;

create or replace function private.hash_token(raw text)
returns text language sql immutable set search_path = '' as $$
  select encode(sha256(convert_to(raw, 'utf8')), 'hex');
$$;

create or replace function private.new_site_key()
returns text language sql volatile set search_path = '' as $$
  select 'zs_' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 24);
$$;

create or replace function private.default_org_settings()
returns jsonb language sql immutable set search_path = '' as $$
  select jsonb_build_object(
    'booking', jsonb_build_object(
      'slot_minutes', 30,
      'lead_time_minutes', 60,
      'max_days_ahead', 60,
      'auto_confirm', true,
      'require_phone', true,
      'max_party_size', 12
    ),
    'modules', jsonb_build_object('menu', true, 'events', true, 'classes', false),
    'public_widget', jsonb_build_object('primary_color', '#111111', 'show_prices', true)
  );
$$;
