-- Welcome email bookkeeping: send at most once per user, even with concurrent sign-ins.

alter table public.profiles add column welcomed_at timestamptz;
-- No grant changes: clients can still only update display_name and avatar_url.

-- Atomically marks the caller as welcomed. Returns true only for the call that flipped it.
create function public.claim_welcome_email()
returns boolean
language sql
security definer
set search_path = ''
as $$
  with claimed as (
    update public.profiles
       set welcomed_at = now()
     where id = auth.uid() and welcomed_at is null
    returning 1
  )
  select exists (select 1 from claimed);
$$;

revoke execute on function public.claim_welcome_email() from public, anon;
grant execute on function public.claim_welcome_email() to authenticated;
