-- Two-user and anonymous authorization tests. Run: pnpm db:test
begin;
create extension if not exists pgtap with schema extensions;
select plan(22);

-- Fixtures -------------------------------------------------------------------
insert into auth.users (id, instance_id, aud, role, email, raw_user_meta_data)
values
  ('aaaaaaaa-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'a@test.local', '{"display_name":"Alice"}'),
  ('bbbbbbbb-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'b@test.local', '{}');

create function pg_temp.login(uid uuid) returns void language sql as $$
  select set_config('role', 'authenticated', true),
         set_config('request.jwt.claims', json_build_object('sub', uid, 'role', 'authenticated')::text, true);
$$;
create function pg_temp.logout_anon() returns void language sql as $$
  select set_config('role', 'anon', true), set_config('request.jwt.claims', '{"role":"anon"}', true);
$$;

-- Schema guarantees -----------------------------------------------------------
select ok((select relrowsecurity from pg_class where oid = 'public.profiles'::regclass), 'RLS enabled on profiles');
select ok((select relrowsecurity from pg_class where oid = 'public.projects'::regclass), 'RLS enabled on projects');
select is((select display_name from public.profiles where id = 'aaaaaaaa-0000-0000-0000-000000000001'), 'Alice', 'sign-up trigger creates profile with display name');
select is((select count(*)::int from public.profiles where id = 'bbbbbbbb-0000-0000-0000-000000000002'), 1, 'sign-up trigger creates profile without metadata');

-- User A ----------------------------------------------------------------------
select pg_temp.login('aaaaaaaa-0000-0000-0000-000000000001');
select lives_ok($$ insert into public.projects (name, description) values ('Alpha', 'A''s project') $$, 'A can create a project');
select is((select owner_id from public.projects where name = 'Alpha'), 'aaaaaaaa-0000-0000-0000-000000000001'::uuid, 'owner_id defaults to the caller');
select is((select count(*)::int from public.projects), 1, 'A sees exactly their own project');
select throws_ok($$ update public.projects set owner_id = 'bbbbbbbb-0000-0000-0000-000000000002' $$, '42501', null, 'A cannot reassign ownership');
select throws_ok($$ insert into public.projects (name) values ('x') $$, '23514', null, 'name length is enforced by the database');
select lives_ok($$ update public.profiles set display_name = 'Alice A.' where id = auth.uid() $$, 'A can update own profile');

-- User B ----------------------------------------------------------------------
select pg_temp.login('bbbbbbbb-0000-0000-0000-000000000002');
select is((select count(*)::int from public.projects), 0, 'B cannot read A''s projects');
select is((select count(*)::int from public.profiles), 1, 'B reads only their own profile');
update public.projects set name = 'Hacked' where name = 'Alpha';
delete from public.projects where name = 'Alpha';
select throws_ok(
  $$ insert into public.projects (owner_id, name) values ('aaaaaaaa-0000-0000-0000-000000000001', 'Spoof') $$,
  '42501', null, 'B cannot create a project owned by A');
update public.profiles set display_name = 'Hacked' where id = 'aaaaaaaa-0000-0000-0000-000000000001';
select throws_ok($$ insert into public.profiles (id) values (gen_random_uuid()) $$, '42501', null, 'clients cannot insert profiles');

-- Verify B's update/delete attempts above changed nothing (checked as table owner).
reset role;
select is((select name from public.projects where owner_id = 'aaaaaaaa-0000-0000-0000-000000000001'), 'Alpha', 'B''s update of A''s project affected nothing');
select is((select count(*)::int from public.projects where owner_id = 'aaaaaaaa-0000-0000-0000-000000000001'), 1, 'B''s delete of A''s project affected nothing');
select is((select display_name from public.profiles where id = 'aaaaaaaa-0000-0000-0000-000000000001'), 'Alice A.', 'B''s update of A''s profile affected nothing');

-- A can delete their own --------------------------------------------------------
select pg_temp.login('aaaaaaaa-0000-0000-0000-000000000001');
select lives_ok($$ delete from public.projects where name = 'Alpha' $$, 'A can delete own project');
select is((select count(*)::int from public.projects), 0, 'A''s project is gone');

-- Anonymous -------------------------------------------------------------------
select pg_temp.logout_anon();
select throws_ok($$ select * from public.projects $$, '42501', null, 'anon cannot read projects');
select throws_ok($$ select * from public.profiles $$, '42501', null, 'anon cannot read profiles');
select throws_ok($$ insert into public.projects (name) values ('Anon') $$, '42501', null, 'anon cannot create projects');

select * from finish();
rollback;
