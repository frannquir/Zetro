create extension if not exists pgcrypto with schema extensions;
create extension if not exists citext with schema extensions;
create extension if not exists btree_gist with schema extensions;

create schema if not exists private;

grant usage on schema private to anon, authenticated, service_role;

create type public.vertical_type  as enum ('restaurant','cafe','gym','barbershop','generic');
create type public.org_status     as enum ('trial','active','paused','archived');
create type public.member_role    as enum ('owner','manager','staff');
create type public.resource_kind  as enum ('table','chair','room','court','staff','equipment');
create type public.booking_status as enum ('pending','confirmed','seated','completed','cancelled','no_show');
create type public.booking_source as enum ('portal','public_site','walk_in','phone','google');
create type public.payment_status as enum ('paid','pending','overdue','waived');
create type public.lead_status    as enum ('new','contacted','won','lost');
