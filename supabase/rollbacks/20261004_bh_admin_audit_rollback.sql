-- Rollback for 20261004_bh_admin_audit — NON-DESTRUCTIVE.
-- Stops all future audit writes and restores both RPCs exactly to their pre-audit production bodies.
-- bh_admin_audit and every existing row are KEPT, read-only for admins, and still cannot be changed.
-- Full removal of the table is a separate, explicit file: 20261004_bh_admin_audit_cleanup_DESTRUCTIVE.sql

drop trigger if exists bh_summary_drafts_audit on public.bh_summary_drafts;
drop trigger if exists bh_summaries_audit on public.bh_summaries;
drop function if exists public.bh_summary_drafts_audit();
drop function if exists public.bh_summaries_audit();
drop function if exists public.bh_admin_audit_write(text, uuid, text, jsonb);
-- kept on purpose: table bh_admin_audit, its admin-read policy, and the append-only triggers/function

CREATE OR REPLACE FUNCTION public.bh_publish_summary_draft(p_summary_id uuid, p_force boolean DEFAULT false)
 RETURNS bh_summaries
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
declare d public.bh_summary_drafts; live public.bh_summaries;
begin
  if not public.bh_is_admin() then
    raise exception 'not authorized' using errcode = '42501'; end if;
  select * into live from public.bh_summaries where id = p_summary_id for update;
  if not found then raise exception 'summary not found'; end if;
  select * into d from public.bh_summary_drafts where summary_id = p_summary_id for update;
  if not found then raise exception 'no draft to publish'; end if;
  if not p_force and live.updated_at <> d.base_updated_at then
    raise exception 'the live summary changed after this draft was started'
      using errcode = '40001'; end if;
  update public.bh_summaries set
    book_title_ar = d.book_title_ar, book_title_en = d.book_title_en,
    author = d.author, category_id = d.category_id,
    reading_minutes = d.reading_minutes, cover_url = d.cover_url,
    content_free = d.content_free, content_full = d.content_full
  where id = p_summary_id returning * into live;      -- snapshot trigger fires here
  delete from public.bh_summary_drafts where summary_id = p_summary_id;
  return live;
end $function$
;

CREATE OR REPLACE FUNCTION public.bh_restore_summary_version(p_version_id bigint, p_replace_existing_draft boolean DEFAULT false)
 RETURNS uuid
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
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
end $function$
;
