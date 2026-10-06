create table public.payment_records (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  period_month date not null check (extract(day from period_month) = 1),
  amount_cents integer not null check (amount_cents >= 0),
  currency char(3) not null default 'ARS',
  status public.payment_status not null default 'pending',
  due_date date,
  paid_at timestamptz,
  method text,
  note text,
  recorded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (org_id, period_month),
  -- a paid row that can't say when is a row nobody can reconcile against a bank statement
  check (status <> 'paid' or paid_at is not null)
);

alter table public.payment_records enable row level security;

create policy payment_records_select on public.payment_records
  for select using (private.is_member(org_id));

create policy payment_records_write on public.payment_records
  for all using (private.is_platform_admin())
      with check (private.is_platform_admin());
