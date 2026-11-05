-- Stripe billing (basic): customers, subscriptions and an idempotent event log.
-- Users can read only their own billing rows. Nothing is writable from the browser: the only
-- writer is billing_apply_event(), executable by the service role that the verified Stripe
-- webhook uses (src/app/api/stripe/webhook/route.ts).

create table public.billing_customers (
  user_id uuid primary key references auth.users (id) on delete cascade,
  stripe_customer_id text not null unique,
  created_at timestamptz not null default now()
);

create table public.billing_subscriptions (
  id text primary key, -- Stripe subscription id (sub_...)
  user_id uuid not null references auth.users (id) on delete cascade,
  stripe_customer_id text not null,
  status text not null check (status in (
    'incomplete', 'incomplete_expired', 'trialing', 'active', 'past_due', 'canceled', 'unpaid', 'paused'
  )),
  price_id text,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  -- Stripe event time of the last applied change; older events never overwrite newer state.
  event_created timestamptz not null,
  updated_at timestamptz not null default now()
);
create index billing_subscriptions_user_id_idx on public.billing_subscriptions (user_id);

-- One row per processed Stripe event id: replays and duplicate deliveries are no-ops.
create table public.billing_events (
  id text primary key, -- Stripe event id (evt_...)
  type text not null,
  stripe_customer_id text,
  amount_cents bigint, -- invoice.paid only
  currency text,
  created_at timestamptz not null default now()
);

revoke all on table public.billing_customers, public.billing_subscriptions, public.billing_events
  from anon, authenticated;
grant select on table public.billing_customers, public.billing_subscriptions to authenticated;

alter table public.billing_customers enable row level security;
alter table public.billing_subscriptions enable row level security;
alter table public.billing_events enable row level security; -- no policies: no client access

create policy "Billing customers: owner can read"
  on public.billing_customers for select to authenticated
  using (user_id = (select auth.uid()));

create policy "Billing subscriptions: owner can read"
  on public.billing_subscriptions for select to authenticated
  using (user_id = (select auth.uid()));

-- Applies one normalized, signature-verified Stripe event atomically.
-- Returns false when the event id was already processed (duplicate delivery).
-- p_data keys (all optional): user_id, customer_id, subscription_id, status, price_id,
-- current_period_end (epoch seconds), cancel_at_period_end, amount_cents, currency, event_created.
create function public.billing_apply_event(p_event_id text, p_type text, p_data jsonb)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := nullif(p_data ->> 'user_id', '')::uuid;
  v_customer text := nullif(p_data ->> 'customer_id', '');
begin
  insert into public.billing_events (id, type, stripe_customer_id, amount_cents, currency)
  values (p_event_id, p_type, v_customer, (p_data ->> 'amount_cents')::bigint, p_data ->> 'currency')
  on conflict (id) do nothing;
  if not found then
    return false;
  end if;

  if v_user is not null and v_customer is not null then
    insert into public.billing_customers (user_id, stripe_customer_id)
    values (v_user, v_customer)
    on conflict (user_id) do update set stripe_customer_id = excluded.stripe_customer_id;
  elsif v_customer is not null then
    select user_id into v_user from public.billing_customers where stripe_customer_id = v_customer;
  end if;

  -- A subscription we can't tie to a user (e.g. created by hand in Stripe) is recorded as an
  -- event but not applied.
  if p_data ? 'subscription_id' and v_user is not null then
    insert into public.billing_subscriptions as s (
      id, user_id, stripe_customer_id, status, price_id, current_period_end,
      cancel_at_period_end, event_created, updated_at
    ) values (
      p_data ->> 'subscription_id', v_user, v_customer, p_data ->> 'status', p_data ->> 'price_id',
      to_timestamp((p_data ->> 'current_period_end')::bigint),
      coalesce((p_data ->> 'cancel_at_period_end')::boolean, false),
      to_timestamp((p_data ->> 'event_created')::bigint), now()
    )
    on conflict (id) do update set
      status = excluded.status,
      price_id = excluded.price_id,
      current_period_end = excluded.current_period_end,
      cancel_at_period_end = excluded.cancel_at_period_end,
      event_created = excluded.event_created,
      updated_at = now()
    where s.event_created <= excluded.event_created;
  end if;
  return true;
end;
$$;

revoke execute on function public.billing_apply_event(text, text, jsonb) from public, anon, authenticated;
grant execute on function public.billing_apply_event(text, text, jsonb) to service_role;
