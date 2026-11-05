begin;
create extension if not exists pgtap with schema extensions;
select plan(5);

insert into auth.users (id, instance_id, aud, role, email)
values ('cccccccc-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'c@test.local');

select set_config('role', 'authenticated', true),
       set_config('request.jwt.claims', '{"sub":"cccccccc-0000-0000-0000-000000000003","role":"authenticated"}', true);

select is(public.claim_welcome_email(), true, 'first claim wins');
select is(public.claim_welcome_email(), false, 'second claim is refused (send at most once)');
select throws_ok($$ update public.profiles set welcomed_at = null $$, '42501', null, 'clients cannot reset welcomed_at');

select set_config('role', 'anon', true), set_config('request.jwt.claims', '{"role":"anon"}', true);
select throws_ok($$ select public.claim_welcome_email() $$, '42501', null, 'anon cannot call claim_welcome_email');

reset role;
select isnt((select welcomed_at from public.profiles where id = 'cccccccc-0000-0000-0000-000000000003'), null, 'welcomed_at is recorded');

select * from finish();
rollback;
