# Bahjaa Content Platform v1 — SQL Review Notes

This document accompanies `docs/sql/content-platform-v1.sql`.

The SQL file is a **review-only blueprint**. It has not been executed against production.

## What this blueprint creates

### Content core
- `bh_content_types`
- `bh_formats`
- `bh_contents`
- `bh_content_categories`
- `bh_content_formats`
- `bh_sources`
- `bh_content_sources`
- `bh_content_payloads`
- `bh_book_details`
- `bh_case_study_details`

### Commerce foundation
- `bh_products`
- `bh_product_items`
- `bh_prices`
- `bh_entitlements`

### Learning design
- `bh_learning_paths`
- `bh_learning_path_items`

No existing production table is renamed or dropped.

## Strategic design choices

### Versioned payloads
`bh_content_payloads` stores type-specific content structures as JSONB with:
- `schema_key`
- `schema_version`
- `visibility`

This avoids forcing book-summary fields onto case studies, reports, or guides and lets Claude Skills evolve schemas independently.

### Catalog metadata vs protected payload
Published content metadata may remain publicly discoverable even when the full content is paid.

The protected material lives in payload rows with a non-public visibility value.

This is intentional:
- public SEO/catalog pages remain possible
- paid/full content is not exposed by the public RLS policy

### Entitlements
`bh_entitlements` is the future access authority for:
- purchases
- subscriptions
- campaigns
- team seats
- manual grants

The first SQL does **not** expose paid payloads directly through an RLS entitlement check yet. That resolver should be added only after the exact product/payment flow is selected and tested.

### Products vs learning paths
A learning path is instructional structure.
A product is commercial packaging.

A learning path can be sold alone, included in a bundle, or made free without changing its learning structure.

## Verified against the connected Supabase project

Verified on the current project containing Bahjaa tables:

- `bh_categories.id` = `uuid`
- `bh_summaries.id` = `uuid`
- `bh_summaries.category_id` = `uuid`
- `bh_summaries.category_id` has an FK to `bh_categories.id`
- `bh_bookmarks.summary_id` = `uuid` and has an FK to `bh_summaries.id`
- RLS is enabled on `bh_categories`, `bh_summaries`, `bh_admins`, and `bh_bookmarks`
- current rows: 6 categories, 9 summaries, 2 bookmarks

Therefore the v1 blueprint assumptions that `legacy_summary_id` and category relationships use UUID are compatible with the current schema.

## Important review points before execution

1. Decide whether published paid-content metadata should be visible publicly for SEO. Current blueprint says yes.
2. Confirm whether prices should be public. Current blueprint says active prices are public.
3. Decide whether a single content item may have multiple primary formats. Current blueprint enforces one.
4. Decide whether a single content item may have more than one primary source. Current blueprint enforces one.
5. Decide whether learning-path items will eventually include non-content steps such as quizzes or tasks. If yes, generalize the item table before launch.
6. Define admin/editor roles before adding client-side write policies.
7. Define the payment provider before creating order/payment transaction tables.
8. Design an entitlement resolver before exposing `paid`/`premium` payloads.

## Recommended execution sequence

### Migration A — content foundation
Create taxonomies, contents, category links, formats, sources, payloads, and detail tables.

### Migration B — backfill
Create `bh_contents` rows corresponding to existing `bh_summaries`. Keep production reads on the old table.

### Migration C — dual-read validation
Compare old and new results in staging/admin tools.

### Migration D — discovery cutover
Move category and discovery pages to `bh_contents`.

### Migration E — commerce foundation
Create products, prices, entitlements, and learning paths when the product/access work begins.

This sequence is safer than executing the entire blueprint in one production transaction.
