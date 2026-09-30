/**
 * Bahjaa canonical content vocabulary.
 *
 * Keep this aligned with:
 * - docs/content-architecture.md
 * - docs/content-contract.md
 *
 * These are application-level keys, not closed DB enums.
 * Database taxonomies should remain reference-table driven.
 */

export const CONTENT_TYPES = [
  "book_summary",
  "case_study",
  "article",
  "report",
  "guide",
] as const;

export type ContentTypeKey = (typeof CONTENT_TYPES)[number];

export const CONTENT_FORMATS = [
  "text",
  "video",
  "audio",
  "pdf",
  "interactive",
] as const;

export type ContentFormatKey = (typeof CONTENT_FORMATS)[number];

export const ACCESS_LEVELS = [
  "public",
  "email_required",
  "member",
  "paid",
  "premium",
] as const;

export type AccessLevelKey = (typeof ACCESS_LEVELS)[number];

export const CONTENT_STATUSES = [
  "draft",
  "review",
  "scheduled",
  "published",
  "archived",
] as const;

export type ContentStatusKey = (typeof CONTENT_STATUSES)[number];

export const SOURCE_TYPES = [
  "book",
  "article",
  "paper",
  "report",
  "interview",
  "podcast",
  "video",
  "dataset",
  "multi_source",
  "other",
] as const;

export type SourceTypeKey = (typeof SOURCE_TYPES)[number];

export const PRODUCT_TYPES = [
  "single_content",
  "bundle",
  "learning_path",
  "course",
  "digital_download",
  "team_package",
] as const;

export type ProductTypeKey = (typeof PRODUCT_TYPES)[number];

export type ContentClassification = {
  contentType: ContentTypeKey;
  primaryCategory: string;
  secondaryCategories: string[];
  formats: ContentFormatKey[];
  accessLevel: AccessLevelKey;
  sourceType: SourceTypeKey;
};
