-- Passes (trial / 30-day / 1-year / team) and requests for a QPay invoice.
-- Learners can READ their own pass but never write it: passes are set by start_trial() (once per account)
-- or by an admin after the QPay invoice is paid (Supabase dashboard → Table editor → passes).

create table if not exists public.passes (
  user_id     uuid primary key references auth.users (id) on delete cascade,
  plan        text not null check (plan in ('trial', 'month', 'year', 'team')),
  valid_until timestamptz not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
alter table public.passes enable row level security;
drop policy if exists "Read own pass" on public.passes;
create policy "Read own pass" on public.passes for select to authenticated using ((select auth.uid()) = user_id);

-- Free 7-day trial, once per account: if any pass row exists, it is returned unchanged.
create or replace function public.start_trial()
returns public.passes
language plpgsql
security definer
set search_path = ''
as $$
declare
  r public.passes;
begin
  if auth.uid() is null then
    raise exception 'Not signed in';
  end if;
  insert into public.passes (user_id, plan, valid_until)
  values (auth.uid(), 'trial', now() + interval '7 days')
  on conflict (user_id) do nothing;
  select * into r from public.passes where user_id = auth.uid();
  return r;
end;
$$;
revoke all on function public.start_trial() from public, anon;
grant execute on function public.start_trial() to authenticated;

create table if not exists public.pass_requests (
  id         bigint generated always as identity primary key,
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  plan       text not null check (plan in ('month', 'year', 'team')),
  contact    text not null check (char_length(contact) between 3 and 200),
  seats      int check (seats is null or seats between 1 and 500),
  note       text check (note is null or char_length(note) <= 500),
  status     text not null default 'pending' check (status in ('pending', 'invoiced', 'paid', 'cancelled')),
  created_at timestamptz not null default now()
);
create index if not exists pass_requests_user_idx on public.pass_requests (user_id);
alter table public.pass_requests enable row level security;
drop policy if exists "Ask for own invoice" on public.pass_requests;
create policy "Ask for own invoice" on public.pass_requests for insert to authenticated
  with check ((select auth.uid()) = user_id and status = 'pending');
drop policy if exists "Read own requests" on public.pass_requests;
create policy "Read own requests" on public.pass_requests for select to authenticated using ((select auth.uid()) = user_id);
