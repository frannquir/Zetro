create or replace function public.admin_create_org(
  p_name text,
  p_slug text,
  p_vertical public.vertical_type,
  p_owner_email text
) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_org public.orgs;
  v_invite public.invites;
  v_token text;
begin
  if not private.is_platform_admin() then
    raise exception 'forbidden';
  end if;

  if p_slug !~ '^[a-z0-9-]+$' then
    raise exception 'validation_failed';
  end if;

  if p_owner_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then
    raise exception 'validation_failed';
  end if;

  begin
    insert into public.orgs (name, slug, vertical, settings)
    values (p_name, p_slug, p_vertical, private.default_org_settings())
    returning * into v_org;
  exception when unique_violation then
    raise exception 'validation_failed';
  end;

  v_token := private.new_token();

  insert into public.invites (org_id, email, role, token_hash, expires_at, invited_by)
  values (
    v_org.id,
    p_owner_email::extensions.citext,
    'owner',
    private.hash_token(v_token),
    now() + interval '7 days',
    auth.uid()
  )
  returning * into v_invite;

  return jsonb_build_object(
    'org', to_jsonb(v_org),
    'invite', jsonb_build_object(
      'id', v_invite.id,
      'email', v_invite.email,
      'role', v_invite.role,
      'expires_at', v_invite.expires_at,
      'token', v_token
    )
  );
end;
$$;

revoke execute on function public.admin_create_org(text, text, public.vertical_type, text) from public, anon;
grant execute on function public.admin_create_org(text, text, public.vertical_type, text) to authenticated;

create or replace function public.accept_invite(p_token text)
returns public.memberships
language plpgsql security definer set search_path = '' as $$
declare
  v_invite public.invites;
  v_email text;
  v_membership public.memberships;
begin
  if auth.uid() is null then
    raise exception 'unauthorized';
  end if;

  select u.email into v_email from auth.users u where u.id = auth.uid();

  select * into v_invite
  from public.invites i
  where i.token_hash = private.hash_token(p_token)
  for update;

  if v_invite.id is null then
    raise exception 'not_found';
  end if;

  if v_invite.accepted_at is not null or v_invite.expires_at < now() then
    raise exception 'validation_failed';
  end if;

  if v_invite.email <> v_email::extensions.citext then
    raise exception 'forbidden';
  end if;

  insert into public.memberships (org_id, user_id, role)
  values (v_invite.org_id, auth.uid(), v_invite.role)
  on conflict (org_id, user_id) do update set role = excluded.role
  returning * into v_membership;

  update public.invites set accepted_at = now() where id = v_invite.id;

  return v_membership;
end;
$$;

revoke execute on function public.accept_invite(text) from public, anon;
grant execute on function public.accept_invite(text) to authenticated;

create or replace function public.create_invite(
  p_org uuid,
  p_email text,
  p_role public.member_role
) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  v_invite public.invites;
  v_token text;
begin
  if not private.has_role(p_org, array['owner']::public.member_role[]) then
    raise exception 'forbidden';
  end if;

  if p_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then
    raise exception 'validation_failed';
  end if;

  if exists (
    select 1 from public.memberships m
    join auth.users u on u.id = m.user_id
    where m.org_id = p_org and u.email::extensions.citext = p_email::extensions.citext
  ) then
    raise exception 'validation_failed';
  end if;

  v_token := private.new_token();

  insert into public.invites (org_id, email, role, token_hash, expires_at, invited_by)
  values (p_org, p_email::extensions.citext, p_role, private.hash_token(v_token), now() + interval '7 days', auth.uid())
  on conflict (org_id, email) where accepted_at is null
  do update set role = excluded.role,
                token_hash = excluded.token_hash,
                expires_at = excluded.expires_at,
                invited_by = excluded.invited_by,
                created_at = now()
  returning * into v_invite;

  return jsonb_build_object(
    'id', v_invite.id,
    'email', v_invite.email,
    'role', v_invite.role,
    'expires_at', v_invite.expires_at,
    'token', v_token
  );
end;
$$;

revoke execute on function public.create_invite(uuid, text, public.member_role) from public, anon;
grant execute on function public.create_invite(uuid, text, public.member_role) to authenticated;
