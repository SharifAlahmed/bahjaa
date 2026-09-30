# Bahjaa Content Contract v1

Status: **Canonical contract for humans, Claude Skills, importers, and future admin tools**

This contract describes the minimum metadata every Bahjaa knowledge item should provide.

---

## 1. Required classification

Before generating content, classify the item.

```yaml
content_type: book_summary | case_study | article | report | guide
primary_category: string
secondary_categories: []
formats:
  - text
source_type: book | article | paper | report | interview | podcast | video | dataset | multi_source
access_level: public | email_required | member | paid | premium
```

Do not infer a category from format.

---

## 2. Required identity

```yaml
title_ar: string
title_en: string | null
slug: string
excerpt_ar: string
language: ar
estimated_minutes: number | null
```

Slug requirements:
- stable
- URL-safe
- not tied to a temporary campaign
- changing title must not automatically change the slug

---

## 3. Editorial metadata

```yaml
editorial:
  audience: []
  problem_addressed: string | null
  intended_outcome: string | null
  why_now: string | null
  difficulty: beginner | intermediate | advanced | null
  review_status: draft | review | scheduled | published | archived
```

---

## 4. Source metadata

Every item must preserve provenance.

```yaml
sources:
  - role: primary_source | supporting_source | verification_source
    source_type: book | article | paper | report | interview | podcast | video | dataset | other
    title: string
    author_or_publisher: string | null
    url: string | null
    published_at: string | null
    isbn: string | null
    doi: string | null
```

For multi-source research, include every material source that materially supports the output.

---

## 5. Type-specific payloads

### `book_summary`

The current Bahjaa 10-section summary structure remains a valid specialized payload during migration.

```yaml
payload:
  free:
    s1: {}
    s2: {}
    s3: {}
    s4: {}
  full:
    s5: []
    s6: []
    s7: {}
    s8: {}
    s9: {}
    s10: {}
```

Do not force this schema onto case studies, reports, or guides.

### `case_study`

Recommended conceptual sections:

```yaml
payload:
  context:
  challenge:
  decision:
  execution:
  result:
  what_worked:
  what_failed:
  lessons:
  questions_for_reader:
  action_translation:
```

### `article`

Recommended conceptual sections:

```yaml
payload:
  thesis:
  context:
  analysis:
  evidence:
  implications:
  action_points:
```

### `report`

Recommended conceptual sections:

```yaml
payload:
  executive_summary:
  findings:
  evidence:
  implications:
  risks:
  recommendations:
```

### `guide`

Recommended conceptual sections:

```yaml
payload:
  outcome:
  prerequisites:
  steps:
  examples:
  checklist:
  common_mistakes:
  next_actions:
```

These payloads may evolve independently.

---

## 6. Format metadata

A content item may have multiple formats.

```yaml
formats:
  - key: text
    primary: true
  - key: audio
    primary: false
    asset_ref: string | null
  - key: video
    primary: false
    asset_ref: string | null
  - key: pdf
    primary: false
    asset_ref: string | null
```

Video and podcast/audio are formats, not categories.

---

## 7. Access

```yaml
access:
  level: public | email_required | member | paid | premium
  teaser_available: boolean
  teaser_policy: string | null
```

Do not encode product price or purchase state here.

---

## 8. Claude Skill output rule

A Claude Skill must return two layers:

### Layer A — metadata envelope
Classification, identity, sources, editorial metadata, access, and format.

### Layer B — content payload
The content-type-specific structure.

This lets Bahjaa evolve the database without rewriting every content-generation Skill.

---

## 9. Validation before handoff

A Skill must verify:

- title is clear in Arabic
- content type is explicit
- primary category is present
- secondary categories are not duplicates
- formats are explicit
- source provenance is retained
- claims are not detached from their sources
- access level is explicit
- payload matches the content type
- no book-only fields are invented for non-book content
- no payment assumptions are invented

If metadata is uncertain, mark it for editorial review.
