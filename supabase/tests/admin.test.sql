begin;
create extension if not exists pgtap with schema extensions;
select plan(14);

insert into auth.users (id, instance_id, aud, role, email) values
  ('aaaaaaaa-3333-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin-t@test.local'),
  ('bbbbbbbb-3333-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'user-t@test.local');
update public.profiles set is_admin = true where id = 'aaaaaaaa-3333-0000-0000-000000000001';

create function pg_temp.login(uid uuid) returns void language sql as $$
  select set_config('role', 'authenticated', true),
         set_config('request.jwt.claims', json_build_object('sub', uid, 'role', 'authenticated')::text, true);
$$;

select ok(exists (select 1 from cron.job where jobname = 'agentlaunch-daily-stats'), 'stats job is scheduled');

-- Regular user: denied everywhere
select pg_temp.login('bbbbbbbb-3333-0000-0000-000000000002');
select is(public.is_admin(), false, 'user is not an admin');
select is((select count(*)::int from public.profiles), 1, 'user sees only own profile');
select throws_ok($$ select * from public.admin_list_users() $$, '42501', null, 'user cannot list users');
select throws_ok($$ select public.refresh_daily_stats() $$, '42501', null, 'user cannot refresh stats');
select is((select count(*)::int from public.daily_stats), 0, 'user cannot read stats');
select throws_ok($$ update public.profiles set is_admin = true where id = 'bbbbbbbb-3333-0000-0000-000000000002' $$, '42501', null, 'user cannot make themselves admin');

-- Admin
select pg_temp.login('aaaaaaaa-3333-0000-0000-000000000001');
select is(public.is_admin(), true, 'admin is an admin');
select ok((select count(*) from public.profiles) >= 2, 'admin reads all profiles');
select ok(exists (select 1 from public.admin_list_users('user-t', 'all') where email = 'user-t@test.local'), 'admin can search users');
select ok(not exists (select 1 from public.admin_list_users('', 'admin') where not is_admin), 'admin filter returns only admins');
select lives_ok($$ select public.refresh_daily_stats() $$, 'admin can refresh stats');
select ok((select users from public.daily_stats where day = current_date) >= 2, 'stats count users');

-- Anonymous
select set_config('role', 'anon', true), set_config('request.jwt.claims', '{"role":"anon"}', true);
select throws_ok($$ select * from public.admin_list_users() $$, '42501', null, 'anon cannot list users');

select * from finish();
rollback;
