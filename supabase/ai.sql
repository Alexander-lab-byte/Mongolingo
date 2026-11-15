-- Yarii AI: daily use counter. The function itself checks the learner's pass,
-- so nobody can use AI without one by calling the API directly.
create table if not exists public.ai_usage (
  user_id uuid not null references auth.users (id) on delete cascade,
  day     date not null default current_date,
  count   int  not null default 0,
  primary key (user_id, day)
);
alter table public.ai_usage enable row level security;
drop policy if exists "Read own AI usage" on public.ai_usage;
create policy "Read own AI usage" on public.ai_usage for select to authenticated using ((select auth.uid()) = user_id);

-- Counts one AI request. Returns {used, limit}. Raises 'no_pass' or 'limit' (and nothing is counted).
create or replace function public.use_ai()
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  p public.passes;
  lim int;
  n int;
begin
  if auth.uid() is null then
    raise exception 'not_signed_in';
  end if;
  select * into p from public.passes where user_id = auth.uid() and valid_until > now();
  if not found then
    raise exception 'no_pass';
  end if;
  lim := case when p.plan = 'trial' then 15 else 60 end;
  insert into public.ai_usage (user_id, day, count) values (auth.uid(), current_date, 1)
  on conflict (user_id, day) do update set count = public.ai_usage.count + 1
  returning count into n;
  if n > lim then
    raise exception 'limit';
  end if;
  return json_build_object('used', n, 'limit', lim);
end;
$$;
revoke all on function public.use_ai() from public, anon;
grant execute on function public.use_ai() to authenticated;
