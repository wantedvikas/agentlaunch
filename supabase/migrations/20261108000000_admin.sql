-- Basic admin: a database-stored admin flag, admin-only reads, a users list and daily stats.
-- Make someone an admin (SQL editor or psql; there is deliberately no UI for this):
--   update public.profiles set is_admin = true
--    where id = (select id from auth.users where email = 'you@example.com');

alter table public.profiles add column is_admin boolean not null default false;
-- No grant changes: clients still can only update display_name and avatar_url, never is_admin.

create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select is_admin from public.profiles where id = (select auth.uid())), false);
$$;

revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

create policy "Profiles: admins can read all"
  on public.profiles for select to authenticated
  using ((select public.is_admin()));

-- @module:payments
create policy "Billing subscriptions: admins can read all"
  on public.billing_subscriptions for select to authenticated
  using ((select public.is_admin()));
-- @end:payments

-- ---------------------------------------------------------------------------
-- Users list (email lives in auth.users, which clients can't read directly)
-- shortcut: first 100 matches, no pagination; add keyset paging past a few thousand users.
-- ---------------------------------------------------------------------------
create function public.admin_list_users(p_search text default '', p_filter text default 'all')
returns table (
  id uuid, email text, display_name text, created_at timestamptz, is_admin boolean, is_paying boolean
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'admin only' using errcode = '42501';
  end if;
  return query
  select * from (
    select u.id, u.email::text, p.display_name, u.created_at, p.is_admin,
      -- @module:payments
      exists (
        select 1 from public.billing_subscriptions s
         where s.user_id = u.id and s.status in ('active', 'trialing')
      ) or
      -- @end:payments
      false as is_paying
    from auth.users u
    join public.profiles p on p.id = u.id
    where p_search = ''
       or u.email ilike '%' || p_search || '%'
       or p.display_name ilike '%' || p_search || '%'
  ) list
  where p_filter = 'all'
     or (p_filter = 'paying' and list.is_paying)
     or (p_filter = 'admin' and list.is_admin)
  order by list.created_at desc
  limit 100;
end;
$$;

revoke execute on function public.admin_list_users(text, text) from public, anon;
grant execute on function public.admin_list_users(text, text) to authenticated;

-- ---------------------------------------------------------------------------
-- Daily stats: one row per day, refreshed hourly by pg_cron (and on demand by admins)
-- ---------------------------------------------------------------------------
create table public.daily_stats (
  day date primary key,
  users integer not null,
  paying_users integer not null,
  -- shortcut: sums invoice amounts across currencies; split by currency if you sell in several.
  revenue_cents bigint not null, -- all-time paid invoices as of this day
  updated_at timestamptz not null default now()
);

revoke all on table public.daily_stats from anon, authenticated;
grant select on table public.daily_stats to authenticated;
alter table public.daily_stats enable row level security;

create policy "Daily stats: admins can read"
  on public.daily_stats for select to authenticated
  using ((select public.is_admin()));

create function public.refresh_daily_stats()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- pg_cron runs without a user (auth.uid() is null); signed-in callers must be admins.
  if (select auth.uid()) is not null and not public.is_admin() then
    raise exception 'admin only' using errcode = '42501';
  end if;
  insert into public.daily_stats as d (day, users, paying_users, revenue_cents, updated_at)
  select
    current_date,
    (select count(*) from auth.users),
    -- @module:payments
    (select count(distinct user_id) from public.billing_subscriptions
      where status in ('active', 'trialing')) +
    -- @end:payments
    0,
    -- @module:payments
    (select coalesce(sum(amount_cents), 0) from public.billing_events where type = 'invoice.paid') +
    -- @end:payments
    0,
    now()
  on conflict (day) do update set
    users = excluded.users,
    paying_users = excluded.paying_users,
    revenue_cents = excluded.revenue_cents,
    updated_at = now();
end;
$$;

revoke execute on function public.refresh_daily_stats() from public, anon;
grant execute on function public.refresh_daily_stats() to authenticated;

create extension if not exists pg_cron with schema pg_catalog;
select cron.schedule('agentlaunch-daily-stats', '7 * * * *', 'select public.refresh_daily_stats()');
select public.refresh_daily_stats();
