-- Admin v1: restoring a permanently deleted summary keeps its original created_at.
-- Only change vs 20261002_bh_admin_v1_foundation: the re-create INSERT now sets created_at
-- from the snapshot (falls back to now()). Everything else is identical.
--   status = 'draft', published_at = null, first_published_at rule: unchanged.
--   updated_at: column default now() -> the restore time.
--   rating_value: not set here on purpose; trigger bh_sync_rating_value_trg derives it
--   from content_full.s10.value on INSERT.
--   is_featured / archived_at: not restored on purpose (restored row is a plain visible draft).
-- create or replace keeps the existing grants (authenticated only).

create or replace function public.bh_restore_summary_version(
  p_version_id bigint,
  p_replace_existing_draft boolean default false)
returns uuid
language plpgsql security invoker set search_path = public as $$
declare v public.bh_summary_versions; s jsonb; live public.bh_summaries;
begin
  if not public.bh_is_admin() then
    raise exception 'not authorized' using errcode = '42501'; end if;
  select * into v from public.bh_summary_versions where id = p_version_id;
  if not found then raise exception 'version not found'; end if;
  s := v.snapshot;
  select * into live from public.bh_summaries where id = v.summary_id;
  if found then
    if not p_replace_existing_draft
       and exists (select 1 from public.bh_summary_drafts where summary_id = v.summary_id) then
      raise exception 'this summary already has unpublished changes: publish or discard them, or confirm replacing them'
        using errcode = 'check_violation';
    end if;
    insert into public.bh_summary_drafts
      (summary_id, book_title_ar, book_title_en, author, category_id, reading_minutes,
       cover_url, content_free, content_full, base_updated_at)
    values
      (v.summary_id, s->>'book_title_ar', s->>'book_title_en', s->>'author',
       (s->>'category_id')::uuid, (s->>'reading_minutes')::int, s->>'cover_url',
       coalesce(s->'content_free','{}'::jsonb), coalesce(s->'content_full','{}'::jsonb),
       live.updated_at)
    on conflict (summary_id) do update set      -- reached only when p_replace_existing_draft
      book_title_ar = excluded.book_title_ar, book_title_en = excluded.book_title_en,
      author = excluded.author, category_id = excluded.category_id,
      reading_minutes = excluded.reading_minutes, cover_url = excluded.cover_url,
      content_free = excluded.content_free, content_full = excluded.content_full,
      base_updated_at = excluded.base_updated_at,
      updated_by = auth.jwt() ->> 'email';
  else
    insert into public.bh_summaries
      (id, slug, book_title_ar, book_title_en, author, cover_url, category_id,
       content_free, content_full, reading_minutes,
       status, published_at, first_published_at,
       source_tier, source_notes, created_at)
    values
      (v.summary_id, s->>'slug', s->>'book_title_ar', s->>'book_title_en', s->>'author',
       s->>'cover_url', (s->>'category_id')::uuid,
       coalesce(s->'content_free','{}'::jsonb), coalesce(s->'content_full','{}'::jsonb),
       (s->>'reading_minutes')::int,
       'draft', null,
       coalesce((s->>'first_published_at')::timestamptz, (s->>'published_at')::timestamptz),
       s->>'source_tier', s->>'source_notes',
       coalesce((s->>'created_at')::timestamptz, now()));
  end if;
  return v.summary_id;
end $$;
