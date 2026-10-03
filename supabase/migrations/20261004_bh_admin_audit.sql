-- Admin v1: append-only audit trail for admin actions on summaries.
-- Written only by database triggers (two RPCs only set a transaction-local marker), so every path is
-- captured — admin UI, RPCs, direct SQL — and application code cannot skip it.
-- Admins may read; nobody can insert/update/delete through the API. Rows can never be changed.
-- Text content is NOT duplicated: bh_summary_versions remains the source for previous content.
-- Re-runnable: safe to apply again after the non-destructive rollback (existing rows are kept).

create table if not exists public.bh_admin_audit (
  id            bigint generated always as identity primary key,
  at            timestamptz not null default clock_timestamp(),
  actor_user_id uuid,          -- JWT sub (null for direct SQL)
  actor_email   text,          -- JWT email (null for direct SQL)
  session_id    uuid,          -- JWT session_id, where available
  db_role       text not null, -- 'authenticated' through the app; e.g. 'postgres' for direct SQL
  action        text not null check (action in (
                  'publish','publish_changes','unpublish','archive','unarchive','feature','unfeature',
                  'cover_set','cover_remove','cover_restore',
                  'delete','restore_deleted','restore_to_draft')),
  summary_id    uuid,          -- no FK on purpose: the line must survive a permanent delete
  slug          text,
  details       jsonb not null default '{}'::jsonb
);
create index if not exists bh_admin_audit_summary_idx on public.bh_admin_audit (summary_id, id);
create index if not exists bh_admin_audit_at_idx on public.bh_admin_audit (at);

alter table public.bh_admin_audit enable row level security;
revoke all on public.bh_admin_audit from public, anon, authenticated;
grant select on public.bh_admin_audit to authenticated;
drop policy if exists bh_admin_audit_admin_read on public.bh_admin_audit;
create policy bh_admin_audit_admin_read on public.bh_admin_audit
  for select to authenticated using (public.bh_is_admin());

-- Append-only even for the table owner: rows cannot be changed, removed or truncated.
create or replace function public.bh_admin_audit_immutable() returns trigger
language plpgsql as $$
begin
  raise exception 'bh_admin_audit is append-only' using errcode = '42501';
end $$;
drop trigger if exists bh_admin_audit_no_change on public.bh_admin_audit;
create trigger bh_admin_audit_no_change before update or delete on public.bh_admin_audit
  for each row execute function public.bh_admin_audit_immutable();
drop trigger if exists bh_admin_audit_no_truncate on public.bh_admin_audit;
create trigger bh_admin_audit_no_truncate before truncate on public.bh_admin_audit
  for each statement execute function public.bh_admin_audit_immutable();

-- One audit line. Internal: called only from the trigger functions below.
create or replace function public.bh_admin_audit_write(p_action text, p_summary_id uuid, p_slug text, p_details jsonb)
returns void
language plpgsql security definer set search_path = public as $$
declare claims jsonb := coalesce(auth.jwt(), '{}'::jsonb);
begin
  insert into public.bh_admin_audit (actor_user_id, actor_email, session_id, db_role, action, summary_id, slug, details)
  values (
    auth.uid(),
    claims ->> 'email',
    case when (claims ->> 'session_id') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
         then (claims ->> 'session_id')::uuid end,
    -- role of the caller, not of this definer function: PostgREST sets ROLE; direct SQL leaves it 'none'
    coalesce(nullif(current_setting('role', true), 'none'), session_user),
    p_action, p_summary_id, p_slug, coalesce(p_details, '{}'::jsonb));
end $$;

-- bh_summaries: derive the actions from what actually changed in the row.
create or replace function public.bh_summaries_audit() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  restore_version text := nullif(current_setting('bh.restore_version_id', true), '');
  publish_changes text := nullif(current_setting('bh.publish_changes', true), '');
begin
  if tg_op = 'DELETE' then
    perform public.bh_admin_audit_write('delete', old.id, old.slug, jsonb_build_object(
      'title', old.book_title_ar, 'status', old.status,
      'ever_published', old.first_published_at is not null, 'archived', old.archived_at is not null));
    return old;
  end if;

  if tg_op = 'INSERT' then
    -- only a restore of a permanently deleted summary is logged; ordinary creation is not
    if restore_version is not null then
      perform public.bh_admin_audit_write('restore_deleted', new.id, new.slug,
        jsonb_build_object('version_id', restore_version::bigint));
    end if;
    return new;
  end if;

  -- UPDATE made by bh_publish_summary_draft(): exactly one «publish_changes» event, nothing else
  -- (its cover/content write is part of the same user action; previous content is in bh_summary_versions)
  if publish_changes is not null then
    perform public.bh_admin_audit_write('publish_changes', new.id, new.slug, jsonb_build_object(
      'forced', publish_changes = 'forced',
      'live', new.status = 'published',
      'cover_changed', old.cover_url is distinct from new.cover_url));
    return new;
  end if;

  -- any other UPDATE. Archiving a published summary is ONE action: logged as «archive» with was_published=true,
  -- not as unpublish + archive.
  if old.status = 'published' and new.status <> 'published'
     and not (old.archived_at is null and new.archived_at is not null) then
    perform public.bh_admin_audit_write('unpublish', new.id, new.slug, '{}'::jsonb);
  end if;
  if old.status <> 'published' and new.status = 'published' then
    perform public.bh_admin_audit_write('publish', new.id, new.slug,
      jsonb_build_object('first_publish', old.first_published_at is null));
  end if;
  if old.archived_at is null and new.archived_at is not null then
    perform public.bh_admin_audit_write('archive', new.id, new.slug,
      jsonb_build_object('was_published', old.status = 'published'));
  end if;
  if old.archived_at is not null and new.archived_at is null then
    perform public.bh_admin_audit_write('unarchive', new.id, new.slug, '{}'::jsonb);
  end if;
  if old.is_featured is distinct from new.is_featured then
    perform public.bh_admin_audit_write(case when new.is_featured then 'feature' else 'unfeature' end,
      new.id, new.slug, '{}'::jsonb);
  end if;
  if old.cover_url is distinct from new.cover_url then
    perform public.bh_admin_audit_write(
      case
        when new.cover_url is null then 'cover_remove'
        -- a cover this summary already had before = restore; otherwise a new cover
        when exists (select 1 from public.bh_summary_versions v
                     where v.summary_id = new.id and v.snapshot ->> 'cover_url' = new.cover_url)
          then 'cover_restore'
        else 'cover_set'
      end,
      new.id, new.slug, jsonb_build_object('old', old.cover_url, 'new', new.cover_url));
  end if;
  return new;
end $$;

drop trigger if exists bh_summaries_audit on public.bh_summaries;
create trigger bh_summaries_audit after insert or update or delete on public.bh_summaries
  for each row execute function public.bh_summaries_audit();

-- bh_summary_drafts: a version restored into the draft (only when the restore function marked it).
create or replace function public.bh_summary_drafts_audit() returns trigger
language plpgsql security definer set search_path = public as $$
declare restore_version text := nullif(current_setting('bh.restore_version_id', true), '');
begin
  if restore_version is not null then
    perform public.bh_admin_audit_write('restore_to_draft', new.summary_id,
      (select s.slug from public.bh_summaries s where s.id = new.summary_id),
      jsonb_build_object('version_id', restore_version::bigint, 'replaced_existing_draft', tg_op = 'UPDATE'));
  end if;
  return new;
end $$;

drop trigger if exists bh_summary_drafts_audit on public.bh_summary_drafts;
create trigger bh_summary_drafts_audit after insert or update on public.bh_summary_drafts
  for each row execute function public.bh_summary_drafts_audit();

-- The audit functions are never callable through the API.
revoke execute on function
  public.bh_admin_audit_write(text, uuid, text, jsonb),
  public.bh_admin_audit_immutable(),
  public.bh_summaries_audit(),
  public.bh_summary_drafts_audit()
from public, anon, authenticated;

-- bh_publish_summary_draft: identical to production, plus two lines marking its UPDATE as «publish_changes».
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
  -- marks the UPDATE below as «publish_changes» for the audit trigger (one event; transaction-local)
  perform set_config('bh.publish_changes', case when p_force then 'forced' else 'normal' end, true);
  update public.bh_summaries set
    book_title_ar = d.book_title_ar, book_title_en = d.book_title_en,
    author = d.author, category_id = d.category_id,
    reading_minutes = d.reading_minutes, cover_url = d.cover_url,
    content_free = d.content_free, content_full = d.content_full
  where id = p_summary_id returning * into live;      -- snapshot trigger fires here
  perform set_config('bh.publish_changes', '', true);
  delete from public.bh_summary_drafts where summary_id = p_summary_id;
  return live;
end $function$
;

-- bh_restore_summary_version: identical to production, plus three lines marking the write as a version restore.
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
    -- marks the draft write below as a version restore for the audit trigger (transaction-local)
    perform set_config('bh.restore_version_id', p_version_id::text, true);
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
    perform set_config('bh.restore_version_id', p_version_id::text, true);
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
  perform set_config('bh.restore_version_id', '', true);
  return v.summary_id;
end $function$
;
