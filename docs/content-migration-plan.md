# Bahjaa Content Architecture — Migration Plan

Goal: move from `bh_summaries` to a universal content architecture without breaking the current production app.

---

## Phase 0 — now

Canonicalize the architecture in:
- `CLAUDE.md`
- `docs/content-architecture.md`
- `docs/content-contract.md`
- `lib/content-model.ts`

No destructive database change.

---

## Phase 1 — additive database layer

Create new tables alongside existing production tables:

- `bh_contents`
- `bh_content_types`
- `bh_content_categories`
- `bh_formats`
- `bh_content_formats`
- `bh_sources`
- `bh_content_sources`

Seed initial content types and formats.

Do not delete `bh_summaries`.

---

## Phase 2 — compatibility mapping

Backfill one `bh_contents` record per existing summary.

Mapping:

```text
bh_summaries.id            -> legacy_source_id
book_title_ar              -> title_ar
slug                       -> slug
category_id                -> primary category + bh_content_categories
status                     -> status
published_at               -> published_at
reading_minutes            -> estimated_minutes
content_free/content_full  -> book-summary specialized payload
```

Keep current summary pages working while validating the new model.

---

## Phase 3 — read-path migration

Move category/discovery queries to `bh_contents`.

The category UI must query:
- category relationship
- content type
- access level
- primary format

At this stage a category page can naturally show:
book summaries + case studies + articles.

---

## Phase 4 — authoring migration

Update Claude Skills and admin/import workflows to write through the canonical content contract.

New content should no longer be summary-first.

Existing book-summary generation remains supported as `content_type=book_summary`.

---

## Phase 5 — commerce

Add:

- `bh_products`
- `bh_product_items`
- `bh_prices`
- `bh_entitlements`
- order/payment tables appropriate to the selected payment provider

Access checks should resolve entitlements rather than inspect product type.

---

## Phase 6 — learning paths

Add:

- `bh_learning_paths`
- `bh_learning_path_items`

Use these for structured skill-development experiences such as:
"Master Delegation", "Strategic Thinking", or "Build a High-Performance Team".

A learning path may be:
- free
- gated
- premium
- included in a bundle
- licensed to a team

---

## Migration safety rules

- no big-bang rewrite
- no destructive rename of `bh_summaries` until all reads are migrated
- preserve IDs or maintain explicit legacy mapping
- preserve slugs
- migration scripts must be idempotent where practical
- RLS and entitlement rules must be designed before paid content is launched
- production writes must have a rollback path
