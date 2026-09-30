# Bahjaa Content Architecture v1

Status: **Canonical architecture**
Purpose: keep Bahjaa coherent as it expands from book summaries into a multi-format, premium knowledge platform.

---

## 1. Core principle

Bahjaa content must be modeled across independent dimensions.

### Topic / Category
**Question:** What is this content about?

Examples:
- leadership
- entrepreneurship
- productivity
- strategy
- teams
- business

A content item has one primary category and may have multiple secondary categories.

### Content Type
**Question:** What did Bahjaa create?

Initial types:
- `book_summary`
- `case_study`
- `article`
- `report`
- `guide`

Future examples:
- `research_brief`
- `framework`
- `playbook`
- `course_lesson`

### Format
**Question:** How can the user consume it?

Examples:
- `text`
- `video`
- `audio`
- `pdf`
- `interactive`

A single content item may have more than one format.

### Source
**Question:** Where did the knowledge come from?

Examples:
- book
- article
- academic paper
- company filing
- interview
- podcast
- video
- dataset
- multiple-source research

### Access
**Question:** Who can access it?

Initial access levels:
- `public`
- `email_required`
- `member`
- `paid`
- `premium`

Access level is independent of content type.

### Product
**Question:** What is being sold?

A product is not necessarily a content item. It may package many items.

Examples:
- single premium guide
- bundle
- learning path
- digital workbook
- course
- team license

---

## 2. Canonical entities

### `bh_contents`
The universal content entity.

Suggested core fields:

```text
id
slug
title_ar
title_en
excerpt_ar
content_type_id
primary_category_id
status
access_level
published_at
created_at
updated_at
seo_title
seo_description
hero_asset_id
estimated_minutes
editorial_score
```

Do not put book-only, case-only, or media-only fields here.

### `bh_categories`
Topic taxonomy.

```text
id
slug
name_ar
description_ar
sort_order
status
```

### `bh_content_categories`
Many-to-many content/category relationship.

```text
content_id
category_id
is_primary
sort_order
```

Constraint: one content item should have exactly one primary category.

### `bh_content_types`
Reference table rather than a hard-coded database enum.

```text
id
key
name_ar
description_ar
status
```

### `bh_formats`
Reference table.

```text
id
key
name_ar
status
```

### `bh_content_formats`
Many-to-many relation between content and formats.

```text
content_id
format_id
asset_id
is_primary
```

### `bh_sources`
Canonical source records.

```text
id
source_type
title
author_or_publisher
url
published_at
isbn
doi
metadata_json
```

### `bh_content_sources`
Links Bahjaa content to one or more sources.

```text
content_id
source_id
role
is_primary
notes
```

Possible roles:
- primary_source
- supporting_source
- verification_source
- inspiration

---

## 3. Type-specific detail tables

Keep universal fields in `bh_contents`; keep specialized fields outside it.

Examples:

### `bh_book_details`
```text
content_id
book_title_original
book_author
publisher
publication_year
isbn
page_count
```

### `bh_case_study_details`
```text
content_id
organization
industry
country
case_period
decision_context
outcome_summary
```

Additional specialized detail tables can be added later without changing the universal content model.

---

## 4. Commerce architecture

Premium content and digital products must not be coupled directly.

### `bh_products`
Represents something sellable.

```text
id
slug
name_ar
description_ar
product_type
status
hero_asset_id
```

Suggested product types:
- `single_content`
- `bundle`
- `learning_path`
- `course`
- `digital_download`
- `team_package`

### `bh_product_items`
Allows a product to contain heterogeneous items.

```text
product_id
item_type
item_id
sort_order
is_required
```

`item_type` may point to:
- content
- learning_path
- downloadable_asset
- future resource types

### `bh_prices`
Keep price history and currencies separate from products.

```text
id
product_id
currency
amount_minor
billing_type
active_from
active_to
is_active
```

### `bh_entitlements`
The canonical access-right layer.

```text
id
user_id
resource_type
resource_id
source_type
source_id
starts_at
expires_at
status
```

Examples:
- purchase grants access to a bundle
- subscription grants access to a premium collection
- company seat grants access to a learning path
- campaign grants temporary access to a guide

The UI asks the entitlement layer whether access is allowed. It must not encode purchase logic per content type.

---

## 5. Learning paths / skill bundles

A "How to master X" bundle should be modeled as a structured learning path, not only a product bundle.

### `bh_learning_paths`

```text
id
slug
title_ar
description_ar
outcome_ar
difficulty
estimated_minutes
status
```

### `bh_learning_path_items`

```text
learning_path_id
content_id
stage_key
sort_order
is_required
instruction_ar
```

A learning path may include:
- book summaries
- case studies
- articles
- guides
- videos
- audio
- worksheets
- interactive tools

A learning path may itself be free or premium, and it may also be sold inside a product.

This separates **learning design** from **commercial packaging**.

---

## 6. Editorial workflow

Recommended statuses:

- `draft`
- `review`
- `scheduled`
- `published`
- `archived`

Optional later:
- `needs_revision`
- `fact_check`

Claude-generated material should enter the editorial workflow rather than publishing automatically.

---

## 7. Discovery architecture

Bahjaa should support two independent discovery axes.

### Browse by topic
"الأقسام"

Example:
Leadership → book summaries + case studies + articles + videos related to leadership.

### Browse by content type
Example:
- ملخصات الكتب
- دراسات الحالة
- المقالات والتحليلات
- التقارير
- الأدلة العملية

Formats such as video/audio are filters or presentation modes, not topic categories.

---

## 8. Future-proofing rules

1. Never create a new category merely because a new media format appears.
2. Never create a new content type merely because access is paid.
3. Never hard-code the number of categories.
4. Never assume one content item belongs to only one topic.
5. Never assume a product maps to one content item.
6. Never assume a paid user owns all premium content.
7. Never store commerce logic inside editorial content fields.
8. Never duplicate source metadata across every content type.
9. Prefer reference tables over closed database enums for taxonomies expected to evolve.
10. Preserve stable slugs and IDs through migration.

---

## 9. Mental model

```text
TOPIC
  category

KNOWLEDGE OBJECT
  content
  content_type

PRESENTATION
  format
  asset

EVIDENCE
  source

ACCESS
  access_level
  entitlement

LEARNING DESIGN
  learning_path

COMMERCE
  product
  price
  order
```

These layers are related, but they must remain conceptually separate.
