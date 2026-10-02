-- Rollback for supabase/migrations/20261002_bh_admin_v1_foundation.sql
-- Returns the database to its state before Step 1. Discards any drafts,
-- versions and site content created in the meantime.

drop trigger if exists bh_summaries_guard        on public.bh_summaries;
drop trigger if exists bh_summaries_snapshot_upd on public.bh_summaries;
drop trigger if exists bh_summaries_snapshot_del on public.bh_summaries;
drop function if exists public.bh_publish_summary_draft(uuid, boolean);
drop function if exists public.bh_restore_summary_version(bigint, boolean);
drop function if exists public.bh_delete_summary(uuid, text);
drop function if exists public.bh_publish_site_content(text);
drop function if exists public.bh_restore_site_content_version(bigint, boolean);
drop table if exists public.bh_summary_drafts;
drop table if exists public.bh_summary_versions;
drop table if exists public.bh_site_content;           -- drops its two snapshot triggers
drop table if exists public.bh_site_content_versions;
drop function if exists public.bh_summaries_guard();
drop function if exists public.bh_snapshot_summary();
drop function if exists public.bh_snapshot_site_content();
-- also drops the archive constraint and the column grants
alter table public.bh_summaries
  drop column if exists archived_at,
  drop column if exists first_published_at;
-- restore the default anon grants that Step 1 revoked (RLS still blocks anon writes)
grant insert, update, delete, truncate on public.bh_summaries to anon;
