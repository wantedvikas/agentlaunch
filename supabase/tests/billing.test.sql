begin;
create extension if not exists pgtap with schema extensions;
select plan(15);

insert into auth.users (id, instance_id, aud, role, email) values
  ('aaaaaaaa-2222-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'ba@test.local'),
  ('bbbbbbbb-2222-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'bb@test.local');

create function pg_temp.login(uid uuid) returns void language sql as $$
  select set_config('role', 'authenticated', true),
         set_config('request.jwt.claims', json_build_object('sub', uid, 'role', 'authenticated')::text, true);
$$;

-- The webhook (service role) applies events; duplicates and stale events are no-ops.
set local role service_role;
select is(public.billing_apply_event('evt_1', 'customer.subscription.created', '{
  "user_id": "aaaaaaaa-2222-0000-0000-000000000001", "customer_id": "cus_A", "subscription_id": "sub_A",
  "status": "active", "price_id": "price_1", "current_period_end": 1900000000, "event_created": 1800000000}'),
  true, 'first delivery is applied');
select is(public.billing_apply_event('evt_1', 'customer.subscription.created', '{
  "user_id": "aaaaaaaa-2222-0000-0000-000000000001", "customer_id": "cus_A", "subscription_id": "sub_A",
  "status": "canceled", "event_created": 1800000000}'),
  false, 'duplicate event id is ignored');
select is((select status from public.billing_subscriptions where id = 'sub_A'), 'active', 'duplicate did not change state');
select is((select stripe_customer_id from public.billing_customers where user_id = 'aaaaaaaa-2222-0000-0000-000000000001'), 'cus_A', 'customer is linked to the user');

select public.billing_apply_event('evt_old', 'customer.subscription.updated', '{
  "customer_id": "cus_A", "subscription_id": "sub_A", "status": "past_due", "event_created": 1700000000}');
select is((select status from public.billing_subscriptions where id = 'sub_A'), 'active', 'an older event never overwrites newer state');

select public.billing_apply_event('evt_2', 'customer.subscription.deleted', '{
  "customer_id": "cus_A", "subscription_id": "sub_A", "status": "canceled", "event_created": 1800000100}');
select is((select status from public.billing_subscriptions where id = 'sub_A'), 'canceled', 'a newer event found via the customer id is applied');

select public.billing_apply_event('evt_3', 'customer.subscription.created', '{
  "customer_id": "cus_unknown", "subscription_id": "sub_X", "status": "active", "event_created": 1800000000}');
select ok(not exists (select 1 from public.billing_subscriptions where id = 'sub_X'), 'subscription for an unknown customer is not applied');

select public.billing_apply_event('evt_4', 'customer.subscription.created', '{
  "user_id": "bbbbbbbb-2222-0000-0000-000000000002", "customer_id": "cus_B", "subscription_id": "sub_B",
  "status": "active", "event_created": 1800000000}');
select public.billing_apply_event('evt_5', 'invoice.paid', '{"customer_id": "cus_B", "amount_cents": 1200, "currency": "usd"}');
select is((select amount_cents from public.billing_events where id = 'evt_5'), 1200::bigint, 'invoice amount is recorded');

-- User A: only own rows, no writes, no direct event access
select pg_temp.login('aaaaaaaa-2222-0000-0000-000000000001');
select is((select count(*)::int from public.billing_subscriptions), 1, 'A sees only own subscription');
select is((select count(*)::int from public.billing_customers), 1, 'A sees only own customer row');
select throws_ok($$ select * from public.billing_events $$, '42501', null, 'A cannot read the event log');
select throws_ok($$ insert into public.billing_subscriptions (id, user_id, stripe_customer_id, status, event_created) values ('sub_fake', 'aaaaaaaa-2222-0000-0000-000000000001', 'cus_A', 'active', now()) $$, '42501', null, 'A cannot grant themselves a subscription');
select throws_ok($$ update public.billing_subscriptions set status = 'active' $$, '42501', null, 'A cannot change subscription status');
select throws_ok($$ select public.billing_apply_event('evt_x', 'x', '{}') $$, '42501', null, 'A cannot call the webhook function');

-- Anonymous
select set_config('role', 'anon', true), set_config('request.jwt.claims', '{"role":"anon"}', true);
select throws_ok($$ select * from public.billing_subscriptions $$, '42501', null, 'anon cannot read subscriptions');

select * from finish();
rollback;
