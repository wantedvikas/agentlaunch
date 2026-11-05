begin;
create extension if not exists pgtap with schema extensions;
select plan(11);

insert into auth.users (id, instance_id, aud, role, email) values
  ('aaaaaaaa-1111-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'ua@test.local'),
  ('bbbbbbbb-1111-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'ub@test.local');

create function pg_temp.login(uid uuid) returns void language sql as $$
  select set_config('role', 'authenticated', true),
         set_config('request.jwt.claims', json_build_object('sub', uid, 'role', 'authenticated')::text, true);
$$;

-- Bucket guarantees
select is((select public from storage.buckets where id = 'uploads'), false, 'uploads bucket is private');
select is((select file_size_limit from storage.buckets where id = 'uploads'), 5242880::bigint, 'bucket enforces 5 MiB');
select ok(not exists (select 1 from storage.buckets where id = 'uploads' and 'image/svg+xml' = any(allowed_mime_types)), 'SVG is not allowed');
select ok(exists (select 1 from storage.buckets where id = 'uploads' and 'application/pdf' = any(allowed_mime_types)), 'PDF is allowed');

-- User A
select pg_temp.login('aaaaaaaa-1111-0000-0000-000000000001');
select lives_ok($$ insert into storage.objects (bucket_id, name) values ('uploads', 'aaaaaaaa-1111-0000-0000-000000000001/x-a.png') $$, 'A can upload into own folder');
select throws_ok($$ insert into storage.objects (bucket_id, name) values ('uploads', 'bbbbbbbb-1111-0000-0000-000000000002/x-evil.png') $$, '42501', null, 'A cannot upload into B''s folder');
select throws_ok($$ insert into storage.objects (bucket_id, name) values ('uploads', 'loose.png') $$, '42501', null, 'A cannot upload outside a user folder');
select is((select count(*)::int from storage.objects where bucket_id = 'uploads'), 1, 'A sees only own file');

-- User B
select pg_temp.login('bbbbbbbb-1111-0000-0000-000000000002');
select is((select count(*)::int from storage.objects where bucket_id = 'uploads'), 0, 'B cannot list A''s files');
-- Deletes go through the Storage API (direct SQL deletes are blocked by storage), so cross-user
-- delete denial is covered by the end-to-end tests.

-- Anonymous
select set_config('role', 'anon', true), set_config('request.jwt.claims', '{"role":"anon"}', true);
select is((select count(*)::int from storage.objects where bucket_id = 'uploads'), 0, 'anon sees no files');
select throws_ok($$ insert into storage.objects (bucket_id, name) values ('uploads', 'anon/x.png') $$, '42501', null, 'anon cannot upload');

select * from finish();
rollback;
