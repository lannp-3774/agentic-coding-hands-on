-- ROLLBACK STRATEGY
-- Supabase migrations are forward-only: never edit or delete this file once applied
-- anywhere. To undo it, add a NEW migration (forward-fix) containing the down SQL below.
-- It depends on 20261014004500_create_kudos_write (kudos_images lookups); nothing depends
-- on it.
--
-- Down SQL (for a new migration, not run automatically), in dependency order:
--   drop policy if exists kudos_images_objects_select_attached on storage.objects;
--   drop policy if exists kudos_images_objects_delete_own_draft on storage.objects;
--   drop policy if exists kudos_images_objects_select_own on storage.objects;
--   drop policy if exists kudos_images_objects_insert_own on storage.objects;
--   drop function if exists public.kudos_image_is_attached(text);
--   -- The `images` bucket and its objects are kept (delete them via the Storage API).
--
-- F010 Kudos images (plan 261013-1628-write-kudos-modal, review rounds 1-2, C1/M1/M2/M-P2):
-- - Private bucket `images` (jpeg/png, 5 MiB), served by the app route
--   /api/kudos/images/<uuid>.<ext> so image paths stay local.
-- - Object names are kudos/<random uuid>.<jpg|png>: they never carry the uploader, so an
--   anonymous kudos' images cannot be linked to its sender. Storage stamps owner_id (the
--   uploader's auth uid, text) on insert; ownership is checked on that column only.
-- - A draft (an object no kudos_images row references) is private to its owner, who may
--   delete it. Once attached, an image is public (every kudos is) and can no longer be
--   deleted by its owner. create_kudos attaches only the caller's own unattached objects.

-- Storage bucket (also declared in supabase/config.toml for local stacks; keep both in sync).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('images', 'images', false, 5242880, array['image/jpeg', 'image/png'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Whether a kudos uses the object kudos/<file> (its kudos_images.image_path is
-- /api/kudos/images/<file>). One point lookup on kudos_images_uploaded_path_key (the partial
-- index predicate is repeated so it applies). A function, not an inline EXISTS, so the policies
-- below cost one lookup per object: inlined, the EXISTS was planned as a hashed subplan that
-- read every attached row (review M-P2). SECURITY DEFINER keeps it un-inlined; kudos_images is
-- public read anyway, and the answer ("attached or not") is public, so it leaks nothing.
create function public.kudos_image_is_attached(object_name text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select starts_with(object_name, 'kudos/') and exists (
    select 1 from public.kudos_images i
    where i.image_path like '/api/kudos/images/%'
      and i.image_path = '/api/kudos/images/' || substr(object_name, 7)
  );
$$;

-- The policies run as the caller: anon reads attached images, authenticated deletes drafts.
revoke execute on function public.kudos_image_is_attached(text) from public, anon, authenticated;
grant execute on function public.kudos_image_is_attached(text) to anon, authenticated;

-- Uploads only as kudos/<uuid>.<jpg|png> (the only names the image route serves), owned by
-- the uploader. Storage fills owner_id from the caller's JWT, so a forged owner fails here.
create policy kudos_images_objects_insert_own on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'images'
    and name ~ '^kudos/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png)$'
    and owner_id = (select auth.uid())::text
  );

-- The owner reads their own objects. Storage deletes with DELETE ... RETURNING, which also
-- needs read access to the row, so this is what lets the owner delete a draft at all.
create policy kudos_images_objects_select_own on storage.objects
  for select to authenticated
  using (bucket_id = 'images' and owner_id = (select auth.uid())::text);

-- The owner deletes a draft (a removed thumbnail, a closed modal); never an attached image.
create policy kudos_images_objects_delete_own_draft on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'images'
    and owner_id = (select auth.uid())::text
    and not public.kudos_image_is_attached(objects.name)
  );

-- Attached images are public content (every kudos is public); drafts stay private, so anon
-- can neither read nor list them. The GET route reads with this anon policy.
create policy kudos_images_objects_select_attached on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'images' and public.kudos_image_is_attached(objects.name));
