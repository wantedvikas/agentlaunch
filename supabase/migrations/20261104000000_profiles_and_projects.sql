-- AgentLaunch Community: profiles and projects with owner-only row-level security.
-- Principle: deny by default (revoke), grant the minimum per role, then RLS limits rows to the owner.

-- ---------------------------------------------------------------------------
-- Shared trigger: keep updated_at current
-- ---------------------------------------------------------------------------
create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles: one row per auth user, created by trigger on sign-up
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text check (char_length(display_name) <= 80),
  avatar_url text check (avatar_url is null or avatar_url ~ '^https://'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Runs as the table owner so it can insert while RLS denies direct inserts.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    nullif(left(coalesce(new.raw_user_meta_data ->> 'display_name', new.raw_user_meta_data ->> 'full_name', ''), 80), '')
  );
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- projects: example per-user resource
-- ---------------------------------------------------------------------------
create type public.project_status as enum ('active', 'paused', 'archived');

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  -- Defaults to the caller; clients cannot set or change it (see column grants below).
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 2 and 80),
  description text not null default '' check (char_length(description) <= 500),
  status public.project_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index projects_owner_id_created_at_idx on public.projects (owner_id, created_at desc);

create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Grants: Supabase grants everything to anon/authenticated by default; take it back.
-- ---------------------------------------------------------------------------
revoke all on table public.profiles, public.projects from anon, authenticated;

grant select on table public.profiles to authenticated;
grant update (display_name, avatar_url) on table public.profiles to authenticated;

grant select, delete on table public.projects to authenticated;
grant insert (name, description, status) on table public.projects to authenticated;
grant update (name, description, status) on table public.projects to authenticated;

grant usage on type public.project_status to authenticated;

-- ---------------------------------------------------------------------------
-- Row-level security: owners only. (select auth.uid()) is evaluated once per query.
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.projects enable row level security;

create policy "Profiles: owner can read"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()));

create policy "Profiles: owner can update"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy "Projects: owner can read"
  on public.projects for select to authenticated
  using (owner_id = (select auth.uid()));

create policy "Projects: owner can create"
  on public.projects for insert to authenticated
  with check (owner_id = (select auth.uid()));

create policy "Projects: owner can update"
  on public.projects for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create policy "Projects: owner can delete"
  on public.projects for delete to authenticated
  using (owner_id = (select auth.uid()));
