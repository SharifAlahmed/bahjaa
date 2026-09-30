# Bahjaa — Claude working contract

Bahjaa is an Arabic applied-knowledge platform. It is not a book-summary-only product.

Before creating, transforming, importing, or changing content, Claude MUST read:

1. `docs/content-architecture.md`
2. `docs/content-contract.md`
3. `docs/content-migration-plan.md`

The repository is moving from a summary-centric model (`bh_summaries`) to a content-centric model.

## Non-negotiable rules

- Do not treat "book summary" as the universal content model.
- Separate **topic**, **content type**, **format**, **source**, **access**, and **commercial product**.
- A category answers: "What is this about?"
- A content type answers: "What did Bahjaa create?"
- A format answers: "How is it consumed?"
- A source answers: "What evidence/source material was used?"
- A product answers: "What is being sold?"
- Access rights must be modeled through entitlements, not hard-coded against content type.
- A piece of content may belong to multiple categories, but has one primary category for navigation.
- New categories and new content types must not require page rewrites.
- Paid bundles / learning paths may contain heterogeneous content.
- Do not duplicate taxonomy rules inside a skill if the canonical contract already exists in this repo.

## Claude Skills

Any Claude Skill that turns a book, article, report, study, case source, transcript, video, or podcast into Bahjaa content must emit metadata compatible with `docs/content-contract.md`.

Before generation, classify:
- source_type
- content_type
- primary_category
- secondary_categories
- formats
- access_level

When uncertain, preserve uncertainty and request editorial review rather than silently guessing.

## Current compatibility

The production app currently uses `bh_summaries`. Do not break it during migration.
Use the migration plan to move incrementally toward `bh_contents`.
