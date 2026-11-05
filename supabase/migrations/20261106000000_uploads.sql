-- Per-user file uploads in Supabase Storage.
-- Files live at uploads/<user-id>/<random-id>-<name>; policies only allow a user their own folder.

-- Private bucket: no public URLs, so every read needs a short-lived signed URL.
-- Storage itself enforces the size limit and type allowlist, even if app checks are bypassed.
-- SVG is deliberately excluded: it can carry scripts.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'uploads',
  'uploads',
  false,
  5242880, -- 5 MiB
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'application/pdf', 'text/plain']
);

create policy "Uploads: owner can read"
  on storage.objects for select to authenticated
  using (bucket_id = 'uploads' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Uploads: owner can upload"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'uploads' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Uploads: owner can delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'uploads' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- No update policy: files can't be overwritten or moved, only uploaded and deleted.
