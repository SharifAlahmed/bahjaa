-- Bahjaa Admin v1 — Step 1: database foundation
-- Additive only. Rollback: supabase/rollbacks/20261002_bh_admin_v1_foundation_rollback.sql

-- ── 0. Least-privilege hardening on the existing table ───────────────────
revoke insert, update, delete, truncate on public.bh_summaries from anon;

-- ── 1. Unpublished edits to a summary (one row per summary) ──────────────
create table public.bh_summary_drafts (
  summary_id      uuid primary key
                  references public.bh_summaries(id) on delete restrict,
  book_title_ar   text not null check (btrim(book_title_ar) <> ''),
  book_title_en   text,
  author          text,
  category_id     uuid references public.bh_categories(id),
  reading_minutes integer check (reading_minutes between 1 and 120),
  cover_url       text,
  content_free    jsonb not null default '{}'::jsonb
                  check (jsonb_typeof(content_free) = 'object'),
  content_full    jsonb not null default '{}'::jsonb
                  check (jsonb_typeof(content_full) = 'object'),
  -- live row's updated_at when this draft was started (conflict check on publish)
  base_updated_at timestamptz not null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  updated_by      text default (auth.jwt() ->> 'email')
);

-- ── 2. Summary version history (append-only, written by trigger only) ────
create table public.bh_summary_versions (
  id          bigint generated always as identity primary key,
  summary_id  uuid not null,          -- no FK: must survive a permanent delete
  reason      text not null check (reason in ('update','delete')),
  snapshot    jsonb not null,         -- the full live row before the change
  created_at  timestamptz not null default now(),
  created_by  text
);
create index bh_summary_versions_summary_idx
  on public.bh_summary_versions (summary_id, id desc);

-- ── 3. Generic site content: one draft row + one published row per key ───
create table public.bh_site_content (
  key         text not null check (key ~ '^[a-z][a-z0-9_]*$'),
  state       text not null check (state in ('draft','published')),
  value       jsonb not null check (jsonb_typeof(value) = 'object'),
  updated_at  timestamptz not null default now(),
  updated_by  text default (auth.jwt() ->> 'email'),
  primary key (key, state)
);

-- ── 4. Site-content version history (append-only, written by trigger only)
create table public.bh_site_content_versions (
  id          bigint generated always as identity primary key,
  key         text not null,
  value       jsonb not null,         -- the published value before it was replaced
  created_at  timestamptz not null default now(),
  created_by  text
);
create index bh_site_content_versions_key_idx
  on public.bh_site_content_versions (key, id desc);

-- ── 5. Two nullable columns on bh_summaries ──────────────────────────────
alter table public.bh_summaries
  add column archived_at        timestamptz,
  add column first_published_at timestamptz;   -- immutable once set; locks the slug

-- An archived summary can never be published
alter table public.bh_summaries
  add constraint bh_summaries_archived_is_draft
  check (archived_at is null or status = 'draft');

-- SELECT on bh_summaries is granted per column; without this the new functions
-- and the existing /admin/preview select("*") fail with "permission denied"
grant select (archived_at, first_published_at)
  on public.bh_summaries to authenticated;

-- One-time backfill, with triggers off so updated_at is not touched
alter table public.bh_summaries disable trigger user;
update public.bh_summaries
   set first_published_at = coalesce(published_at, created_at)
 where status = 'published' or published_at is not null;
alter table public.bh_summaries enable trigger user;

-- updated_at maintenance, reusing the existing function
create trigger bh_summary_drafts_touch before update on public.bh_summary_drafts
  for each row execute function public.bh_touch_updated_at();
create trigger bh_site_content_touch before update on public.bh_site_content
  for each row execute function public.bh_touch_updated_at();

-- ── 6. Access rules ──────────────────────────────────────────────────────
alter table public.bh_summary_drafts        enable row level security;
alter table public.bh_summary_versions      enable row level security;
alter table public.bh_site_content          enable row level security;
alter table public.bh_site_content_versions enable row level security;

-- Drafts: admins only, full access
revoke all on public.bh_summary_drafts from anon, authenticated;
grant select, insert, update, delete on public.bh_summary_drafts to authenticated;
create policy bh_summary_drafts_admin on public.bh_summary_drafts
  for all to authenticated
  using (public.bh_is_admin()) with check (public.bh_is_admin());

-- Summary versions: admins can read; nobody can write from the API
revoke all on public.bh_summary_versions from anon, authenticated;
grant select on public.bh_summary_versions to authenticated;
create policy bh_summary_versions_admin_read on public.bh_summary_versions
  for select to authenticated using (public.bh_is_admin());

-- Site content: everyone reads published rows; admins read and write all
revoke all on public.bh_site_content from anon, authenticated;
grant select on public.bh_site_content to anon;
grant select, insert, update, delete on public.bh_site_content to authenticated;
create policy bh_site_content_read on public.bh_site_content
  for select to anon, authenticated
  using (state = 'published' or public.bh_is_admin());
create policy bh_site_content_admin_write on public.bh_site_content
  for all to authenticated
  using (public.bh_is_admin()) with check (public.bh_is_admin());

-- Site-content versions: admins can read; nobody can write from the API
revoke all on public.bh_site_content_versions from anon, authenticated;
grant select on public.bh_site_content_versions to authenticated;
create policy bh_site_content_versions_admin_read on public.bh_site_content_versions
  for select to authenticated using (public.bh_is_admin());

-- ── 7. Triggers ──────────────────────────────────────────────────────────
-- First-publish stamp + permanent slug lock
create function public.bh_summaries_guard() returns trigger
language plpgsql set search_path = public as $$
begin
  if tg_op = 'UPDATE' then
    if old.first_published_at is not null and new.slug is distinct from old.slug then
      raise exception 'slug "%" is permanently locked: this summary has been published', old.slug
        using errcode = 'check_violation';
    end if;
    -- immutable once set; stamped the first time status becomes published
    new.first_published_at := coalesce(
      old.first_published_at,
      case when new.status = 'published' then coalesce(new.published_at, now()) end);
  else  -- INSERT
    if new.first_published_at is null and new.status = 'published' then
      new.first_published_at := coalesce(new.published_at, now());
    end if;
  end if;
  return new;
end $$;

create trigger bh_summaries_guard before insert or update on public.bh_summaries
  for each row execute function public.bh_summaries_guard();

-- Snapshot the old summary row before any content change or delete
create function public.bh_snapshot_summary() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.bh_summary_versions (summary_id, reason, snapshot, created_by)
  values (old.id,
          case tg_op when 'DELETE' then 'delete' else 'update' end,
          to_jsonb(old),
          coalesce(auth.jwt() ->> 'email', current_user));
  if tg_op = 'DELETE' then return old; end if;
  return new;
end $$;

create trigger bh_summaries_snapshot_upd before update on public.bh_summaries
  for each row
  when ((old.slug, old.book_title_ar, old.book_title_en, old.author, old.category_id,
         old.reading_minutes, old.cover_url, old.content_free, old.content_full)
        is distinct from
        (new.slug, new.book_title_ar, new.book_title_en, new.author, new.category_id,
         new.reading_minutes, new.cover_url, new.content_free, new.content_full))
  execute function public.bh_snapshot_summary();

create trigger bh_summaries_snapshot_del before delete on public.bh_summaries
  for each row execute function public.bh_snapshot_summary();

-- Snapshot a published site-content value before it is replaced or removed
create function public.bh_snapshot_site_content() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.bh_site_content_versions (key, value, created_by)
  values (old.key, old.value, coalesce(auth.jwt() ->> 'email', current_user));
  if tg_op = 'DELETE' then return old; end if;
  return new;
end $$;

create trigger bh_site_content_snapshot_upd before update on public.bh_site_content
  for each row
  when (old.state = 'published' and old.value is distinct from new.value)
  execute function public.bh_snapshot_site_content();

create trigger bh_site_content_snapshot_del before delete on public.bh_site_content
  for each row
  when (old.state = 'published')
  execute function public.bh_snapshot_site_content();

-- ── 8. Functions (caller's own permissions; all refuse non-admins) ───────
-- Publish a summary draft onto the live row, in one transaction
create function public.bh_publish_summary_draft(p_summary_id uuid, p_force boolean default false)
returns public.bh_summaries
language plpgsql security invoker set search_path = public as $$
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
end $$;

-- Restore a summary version.
--   Summary still exists  -> load the version into its draft (preview, then publish).
--   Summary was deleted   -> re-create it unpublished, slug still locked.
create function public.bh_restore_summary_version(
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
       source_tier, source_notes)
    values
      (v.summary_id, s->>'slug', s->>'book_title_ar', s->>'book_title_en', s->>'author',
       s->>'cover_url', (s->>'category_id')::uuid,
       coalesce(s->'content_free','{}'::jsonb), coalesce(s->'content_full','{}'::jsonb),
       (s->>'reading_minutes')::int,
       'draft', null,
       coalesce((s->>'first_published_at')::timestamptz, (s->>'published_at')::timestamptz),
       s->>'source_tier', s->>'source_notes');
  end if;
  return v.summary_id;
end $$;

-- Permanent delete (Danger Zone)
create function public.bh_delete_summary(p_summary_id uuid, p_confirm_slug text)
returns void
language plpgsql security invoker set search_path = public as $$
begin
  if not public.bh_is_admin() then
    raise exception 'not authorized' using errcode = '42501'; end if;
  if exists (select 1 from public.bh_summary_drafts where summary_id = p_summary_id) then
    raise exception 'this summary has unpublished changes: publish or discard them first'
      using errcode = 'check_violation'; end if;
  delete from public.bh_summaries where id = p_summary_id and slug = p_confirm_slug;
  if not found then
    raise exception 'summary not found or confirmation slug does not match'; end if;
end $$;                                               -- snapshot trigger keeps a copy

-- Publish one site-content key: draft row becomes the published row
create function public.bh_publish_site_content(p_key text)
returns public.bh_site_content
language plpgsql security invoker set search_path = public as $$
declare d public.bh_site_content; r public.bh_site_content;
begin
  if not public.bh_is_admin() then
    raise exception 'not authorized' using errcode = '42501'; end if;
  select * into d from public.bh_site_content where key = p_key and state = 'draft' for update;
  if not found then raise exception 'no draft for key %', p_key; end if;
  insert into public.bh_site_content (key, state, value, updated_by)
  values (p_key, 'published', d.value, auth.jwt() ->> 'email')
  on conflict (key, state) do update          -- snapshot trigger fires on this update
    set value = excluded.value, updated_by = excluded.updated_by
  returning * into r;
  delete from public.bh_site_content where key = p_key and state = 'draft';
  return r;
end $$;

-- Restore a site-content version into the draft row (never straight to published)
create function public.bh_restore_site_content_version(
  p_version_id bigint,
  p_replace_existing_draft boolean default false)
returns public.bh_site_content
language plpgsql security invoker set search_path = public as $$
declare v public.bh_site_content_versions; r public.bh_site_content;
begin
  if not public.bh_is_admin() then
    raise exception 'not authorized' using errcode = '42501'; end if;
  select * into v from public.bh_site_content_versions where id = p_version_id;
  if not found then raise exception 'version not found'; end if;
  if not p_replace_existing_draft
     and exists (select 1 from public.bh_site_content
                  where key = v.key and state = 'draft') then
    raise exception 'key % already has an unpublished draft: publish or discard it, or confirm replacing it', v.key
      using errcode = 'check_violation';
  end if;
  insert into public.bh_site_content (key, state, value, updated_by)
  values (v.key, 'draft', v.value, auth.jwt() ->> 'email')
  on conflict (key, state) do update          -- reached only when p_replace_existing_draft
    set value = excluded.value, updated_by = excluded.updated_by
  returning * into r;
  return r;
end $$;

revoke execute on function
  public.bh_publish_summary_draft(uuid, boolean),
  public.bh_restore_summary_version(bigint, boolean),
  public.bh_delete_summary(uuid, text),
  public.bh_publish_site_content(text),
  public.bh_restore_site_content_version(bigint, boolean)
from public, anon;
grant execute on function
  public.bh_publish_summary_draft(uuid, boolean),
  public.bh_restore_summary_version(bigint, boolean),
  public.bh_delete_summary(uuid, text),
  public.bh_publish_site_content(text),
  public.bh_restore_site_content_version(bigint, boolean)
to authenticated;
