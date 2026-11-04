-- LOCAL DEVELOPMENT ONLY. Applied by `supabase db reset`; never run against production.
-- Demo login (test values, local only): demo@agentlaunch.local / demo-password-123
-- The demo project belongs to this user only, so RLS hides it from everyone else.

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  'd0d0d0d0-0000-4000-8000-000000000001', '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated', 'demo@agentlaunch.local',
  extensions.crypt('demo-password-123', extensions.gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}', '{"display_name":"Demo User"}', now(), now(),
  '', '', '', ''
);

insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values (
  gen_random_uuid(), 'd0d0d0d0-0000-4000-8000-000000000001', 'd0d0d0d0-0000-4000-8000-000000000001',
  '{"sub":"d0d0d0d0-0000-4000-8000-000000000001","email":"demo@agentlaunch.local","email_verified":true}',
  'email', now(), now(), now()
);

insert into public.projects (owner_id, name, description, status) values
  ('d0d0d0d0-0000-4000-8000-000000000001', 'Demo project (seed data)', 'Example data created by supabase/seed.sql. Safe to edit or delete.', 'active');
