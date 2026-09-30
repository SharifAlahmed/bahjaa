-- Bahjaa Content Platform v1
-- REVIEW-ONLY BLUEPRINT. Do not run in production until explicitly approved.
-- Additive by design: does not rename/drop bh_summaries or existing tables.

begin;

create extension if not exists pgcrypto;

-- =========================================================
-- 1) Reference taxonomies
-- =========================================================

create table if not exists public.bh_content_types (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name_ar text not null,
  description_ar text,
  status text not null default 'active'
    check (status in ('active','inactive')),
  created_at timestamptz not null default now()
);

create table if not exists public.bh_formats (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name_ar text not null,
  status text not null default 'active'
    check (status in ('active','inactive')),
  created_at timestamptz not null default now()
);

insert into public.bh_content_types (key, name_ar)
values
  ('book_summary','ملخص كتاب'),
  ('case_study','دراسة حالة'),
  ('article','مقال / تحليل'),
  ('report','تقرير'),
  ('guide','دليل عملي')
on conflict (key) do nothing;

insert into public.bh_formats (key, name_ar)
values
  ('text','نص'),
  ('video','فيديو'),
  ('audio','صوت / بودكاست'),
  ('pdf','PDF'),
  ('interactive','تفاعلي')
on conflict (key) do nothing;

-- =========================================================
-- 2) Universal content entity
-- =========================================================

create table if not exists public.bh_contents (
  id uuid primary key default gen_random_uuid(),
  legacy_summary_id uuid unique,
  slug text not null unique,
  title_ar text not null,
  title_en text,
  excerpt_ar text,

  content_type_id uuid not null references public.bh_content_types(id),
  primary_category_id uuid references public.bh_categories(id),

  status text not null default 'draft'
    check (status in ('draft','review','scheduled','published','archived')),

  access_level text not null default 'public'
    check (access_level in ('public','email_required','member','paid','premium')),

  language_code text not null default 'ar',
  estimated_minutes integer check (estimated_minutes is null or estimated_minutes > 0),
  editorial_score numeric(4,2),

  seo_title text,
  seo_description text,
  hero_asset_ref text,

  scheduled_for timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint bh_contents_publish_state check (
    status <> 'published' or published_at is not null
  )
);

create index if not exists bh_contents_status_idx
  on public.bh_contents(status);

create index if not exists bh_contents_type_idx
  on public.bh_contents(content_type_id);

create index if not exists bh_contents_primary_category_idx
  on public.bh_contents(primary_category_id);

create index if not exists bh_contents_published_at_idx
  on public.bh_contents(published_at desc);

create index if not exists bh_contents_access_idx
  on public.bh_contents(access_level);

-- =========================================================
-- 3) Content ↔ categories (many-to-many)
-- =========================================================

create table if not exists public.bh_content_categories (
  content_id uuid not null references public.bh_contents(id) on delete cascade,
  category_id uuid not null references public.bh_categories(id) on delete cascade,
  is_primary boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  primary key (content_id, category_id)
);

create unique index if not exists bh_content_categories_one_primary_idx
  on public.bh_content_categories(content_id)
  where is_primary = true;

create index if not exists bh_content_categories_category_idx
  on public.bh_content_categories(category_id, sort_order);

-- =========================================================
-- 4) Formats and assets
-- =========================================================

create table if not exists public.bh_content_formats (
  content_id uuid not null references public.bh_contents(id) on delete cascade,
  format_id uuid not null references public.bh_formats(id),
  is_primary boolean not null default false,
  asset_ref text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  primary key (content_id, format_id)
);

create unique index if not exists bh_content_formats_one_primary_idx
  on public.bh_content_formats(content_id)
  where is_primary = true;

-- =========================================================
-- 5) Source provenance
-- =========================================================

create table if not exists public.bh_sources (
  id uuid primary key default gen_random_uuid(),
  source_type text not null
    check (source_type in (
      'book','article','paper','report','interview',
      'podcast','video','dataset','multi_source','other'
    )),
  title text not null,
  author_or_publisher text,
  url text,
  source_published_at timestamptz,
  isbn text,
  doi text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.bh_content_sources (
  content_id uuid not null references public.bh_contents(id) on delete cascade,
  source_id uuid not null references public.bh_sources(id) on delete cascade,
  role text not null default 'supporting_source'
    check (role in (
      'primary_source','supporting_source',
      'verification_source','inspiration'
    )),
  is_primary boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  primary key (content_id, source_id)
);

create unique index if not exists bh_content_sources_one_primary_idx
  on public.bh_content_sources(content_id)
  where is_primary = true;

-- =========================================================
-- 6) Versioned content payloads
-- Allows each content type to evolve independently.
-- =========================================================

create table if not exists public.bh_content_payloads (
  id uuid primary key default gen_random_uuid(),
  content_id uuid not null references public.bh_contents(id) on delete cascade,
  schema_key text not null,
  schema_version integer not null default 1 check (schema_version > 0),
  visibility text not null default 'public'
    check (visibility in ('public','email_required','member','paid','premium')),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(content_id, schema_key, schema_version)
);

create index if not exists bh_content_payloads_content_idx
  on public.bh_content_payloads(content_id, visibility);

-- Specialized metadata stays outside universal bh_contents.

create table if not exists public.bh_book_details (
  content_id uuid primary key references public.bh_contents(id) on delete cascade,
  book_title_original text,
  book_author text,
  publisher text,
  publication_year integer,
  isbn text,
  page_count integer check (page_count is null or page_count > 0)
);

create table if not exists public.bh_case_study_details (
  content_id uuid primary key references public.bh_contents(id) on delete cascade,
  organization text,
  industry text,
  country text,
  case_period text,
  decision_context text,
  outcome_summary text
);

-- =========================================================
-- 7) Commerce foundation
-- Products are sellable containers; they are not content types.
-- =========================================================

create table if not exists public.bh_products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_ar text not null,
  description_ar text,
  product_type text not null
    check (product_type in (
      'single_content','bundle','learning_path',
      'course','digital_download','team_package'
    )),
  status text not null default 'draft'
    check (status in ('draft','active','inactive','archived')),
  hero_asset_ref text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.bh_product_items (
  product_id uuid not null references public.bh_products(id) on delete cascade,
  item_type text not null
    check (item_type in ('content','learning_path','downloadable_asset')),
  item_id uuid not null,
  sort_order integer not null default 0,
  is_required boolean not null default true,
  created_at timestamptz not null default now(),
  primary key (product_id, item_type, item_id)
);

create index if not exists bh_product_items_product_idx
  on public.bh_product_items(product_id, sort_order);

create table if not exists public.bh_prices (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.bh_products(id) on delete cascade,
  currency char(3) not null,
  amount_minor integer not null check (amount_minor >= 0),
  billing_type text not null default 'one_time'
    check (billing_type in ('one_time','recurring')),
  active_from timestamptz not null default now(),
  active_to timestamptz,
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  check (active_to is null or active_to > active_from)
);

create index if not exists bh_prices_product_active_idx
  on public.bh_prices(product_id, is_active);

-- =========================================================
-- 8) Learning paths
-- Learning design is separate from commercial packaging.
-- =========================================================

create table if not exists public.bh_learning_paths (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title_ar text not null,
  description_ar text,
  outcome_ar text,
  difficulty text
    check (difficulty is null or difficulty in ('beginner','intermediate','advanced')),
  estimated_minutes integer check (estimated_minutes is null or estimated_minutes > 0),
  access_level text not null default 'public'
    check (access_level in ('public','email_required','member','paid','premium')),
  status text not null default 'draft'
    check (status in ('draft','review','scheduled','published','archived')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.bh_learning_path_items (
  learning_path_id uuid not null references public.bh_learning_paths(id) on delete cascade,
  content_id uuid not null references public.bh_contents(id) on delete cascade,
  stage_key text,
  sort_order integer not null default 0,
  is_required boolean not null default true,
  instruction_ar text,
  created_at timestamptz not null default now(),
  primary key (learning_path_id, content_id)
);

create index if not exists bh_learning_path_items_order_idx
  on public.bh_learning_path_items(learning_path_id, sort_order);

-- =========================================================
-- 9) Entitlements
-- Central access-right layer for purchases, subscriptions,
-- campaigns, team seats, or manual grants.
-- =========================================================

create table if not exists public.bh_entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  resource_type text not null
    check (resource_type in ('content','product','learning_path')),
  resource_id uuid not null,

  source_type text not null
    check (source_type in (
      'purchase','subscription','campaign',
      'team_seat','manual_grant'
    )),
  source_id text,

  starts_at timestamptz not null default now(),
  expires_at timestamptz,
  status text not null default 'active'
    check (status in ('active','revoked','expired')),

  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),

  check (expires_at is null or expires_at > starts_at)
);

create index if not exists bh_entitlements_user_idx
  on public.bh_entitlements(user_id, status);

create index if not exists bh_entitlements_resource_idx
  on public.bh_entitlements(resource_type, resource_id, status);

-- Prevent identical active grants from being duplicated accidentally.
create unique index if not exists bh_entitlements_dedupe_idx
  on public.bh_entitlements(
    user_id, resource_type, resource_id, source_type, coalesce(source_id,'')
  )
  where status = 'active';

-- =========================================================
-- 10) Updated-at helper
-- =========================================================

create or replace function public.bh_touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists bh_contents_touch on public.bh_contents;
create trigger bh_contents_touch
before update on public.bh_contents
for each row execute function public.bh_touch_updated_at();

drop trigger if exists bh_payloads_touch on public.bh_content_payloads;
create trigger bh_payloads_touch
before update on public.bh_content_payloads
for each row execute function public.bh_touch_updated_at();

drop trigger if exists bh_products_touch on public.bh_products;
create trigger bh_products_touch
before update on public.bh_products
for each row execute function public.bh_touch_updated_at();

drop trigger if exists bh_learning_paths_touch on public.bh_learning_paths;
create trigger bh_learning_paths_touch
before update on public.bh_learning_paths
for each row execute function public.bh_touch_updated_at();

-- =========================================================
-- 11) RLS
-- Principle:
-- - public catalog metadata may be read when published/active
-- - gated payloads are not exposed by default
-- - users may read only their own entitlement rows
-- - writes are service-role / trusted backend only at v1
-- =========================================================

alter table public.bh_content_types enable row level security;
alter table public.bh_formats enable row level security;
alter table public.bh_contents enable row level security;
alter table public.bh_content_categories enable row level security;
alter table public.bh_content_formats enable row level security;
alter table public.bh_sources enable row level security;
alter table public.bh_content_sources enable row level security;
alter table public.bh_content_payloads enable row level security;
alter table public.bh_book_details enable row level security;
alter table public.bh_case_study_details enable row level security;
alter table public.bh_products enable row level security;
alter table public.bh_product_items enable row level security;
alter table public.bh_prices enable row level security;
alter table public.bh_learning_paths enable row level security;
alter table public.bh_learning_path_items enable row level security;
alter table public.bh_entitlements enable row level security;

-- Reference taxonomies are public-readable.
create policy "content types public read"
on public.bh_content_types for select
using (status = 'active');

create policy "formats public read"
on public.bh_formats for select
using (status = 'active');

-- Published content metadata is discoverable regardless of paid status.
-- Sensitive/full payload is protected separately.
create policy "published content metadata public read"
on public.bh_contents for select
using (status = 'published' and published_at <= now());

create policy "published content categories public read"
on public.bh_content_categories for select
using (
  exists (
    select 1 from public.bh_contents c
    where c.id = content_id
      and c.status = 'published'
      and c.published_at <= now()
  )
);

create policy "published content formats public read"
on public.bh_content_formats for select
using (
  exists (
    select 1 from public.bh_contents c
    where c.id = content_id
      and c.status = 'published'
      and c.published_at <= now()
  )
);

-- Sources are readable only when linked to published content.
create policy "published linked sources public read"
on public.bh_sources for select
using (
  exists (
    select 1
    from public.bh_content_sources cs
    join public.bh_contents c on c.id = cs.content_id
    where cs.source_id = id
      and c.status = 'published'
      and c.published_at <= now()
  )
);

create policy "published source links public read"
on public.bh_content_sources for select
using (
  exists (
    select 1 from public.bh_contents c
    where c.id = content_id
      and c.status = 'published'
      and c.published_at <= now()
  )
);

-- Public payload only. Gated/member/paid/premium payloads require
-- a server-side access resolver in the next phase.
create policy "public payload public read"
on public.bh_content_payloads for select
using (
  visibility = 'public'
  and exists (
    select 1 from public.bh_contents c
    where c.id = content_id
      and c.status = 'published'
      and c.published_at <= now()
  )
);

create policy "published book details public read"
on public.bh_book_details for select
using (
  exists (
    select 1 from public.bh_contents c
    where c.id = content_id
      and c.status = 'published'
      and c.published_at <= now()
  )
);

create policy "published case details public read"
on public.bh_case_study_details for select
using (
  exists (
    select 1 from public.bh_contents c
    where c.id = content_id
      and c.status = 'published'
      and c.published_at <= now()
  )
);

-- Product catalog is public; pricing may be displayed publicly.
create policy "active products public read"
on public.bh_products for select
using (status = 'active');

create policy "active product items public read"
on public.bh_product_items for select
using (
  exists (
    select 1 from public.bh_products p
    where p.id = product_id and p.status = 'active'
  )
);

create policy "active prices public read"
on public.bh_prices for select
using (
  is_active = true
  and active_from <= now()
  and (active_to is null or active_to > now())
  and exists (
    select 1 from public.bh_products p
    where p.id = product_id and p.status = 'active'
  )
);

create policy "published learning paths public read"
on public.bh_learning_paths for select
using (status = 'published' and published_at <= now());

create policy "published learning path items public read"
on public.bh_learning_path_items for select
using (
  exists (
    select 1 from public.bh_learning_paths lp
    where lp.id = learning_path_id
      and lp.status = 'published'
      and lp.published_at <= now()
  )
);

-- Users may inspect only their own entitlements.
create policy "users read own entitlements"
on public.bh_entitlements for select
to authenticated
using (user_id = auth.uid());

-- Deliberately no client INSERT/UPDATE/DELETE policies in v1.
-- Trusted backend/service-role performs authoring and commerce writes.

commit;
