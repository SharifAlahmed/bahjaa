-- DESTRUCTIVE cleanup for 20261004_bh_admin_audit. NOT part of the normal rollback.
-- Run only after the normal rollback, and only with explicit approval: it permanently deletes all audit history.

drop table if exists public.bh_admin_audit;   -- also drops its policy, indexes and append-only triggers
drop function if exists public.bh_admin_audit_immutable();
