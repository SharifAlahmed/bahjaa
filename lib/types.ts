// ============================================================
// شكل بيانات ملخص بهجة — الأقسام العشرة
// هذا العقد بين سكيل التلخيص وصفحة العرض. لا تغيّره دون تحديث السكيل.
// ============================================================

export type Category = {
  id: string;
  slug: string;
  name_ar: string;
  description_ar: string | null;
  icon: string | null;
  sort_order: number;
};

/** الأقسام 1-4 — مجانية ومفهرسة في جوجل */
export type ContentFree = {
  /** 1 — ملخص الـ 30 ثانية */
  s1?: {
    problem?: string;
    core_idea?: string;
    best_for?: string;
    not_for?: string;
    verdict?: string;
  };
  /** 2 — لحظة التعرّف */
  s2?: { text?: string };
  /** 3 — لماذا هذا الكتاب الآن؟ */
  s3?: {
    questions?: string[];
    bridge?: string;
    gains?: string;
    author_note?: string;
  };
  /** 4 — الفكرة المحورية */
  s4?: { text?: string };
};

/** الأقسام 5-10 — خلف جدار الإيميل، محمية على مستوى قاعدة البيانات */
export type ContentFull = {
  /** 5 — المحاور الكاملة */
  s5?: Array<{
    title?: string;
    essence?: string;
    why_you?: string;
    common_trap?: string;
  }>;
  /** 6 — الاقتباسات الذهبية */
  s6?: Array<{ quote?: string; interpretation?: string }>;
  /** 7 — مثال واقعي */
  s7?: {
    context?: string;
    situation?: string;
    decision?: string;
    result?: string;
    lesson?: string;
  };
  /** 8 — مسار التحويل */
  s8?: {
    diagnosis?: string;
    zero_step?: string;
    week_plan?: string[];
    team_question?: string;
    success_marker?: string;
  };
  /** 9 — رؤية فريق بهجة النقدية */
  s9?: { liked?: string; wished?: string; arab_context?: string };
  /** 10 — تقييم فريق بهجة */
  s10?: {
    value?: number;
    applicability?: number;
    depth?: number;
    justifications?: {
      value?: string;
      applicability?: string;
      depth?: string;
    };
  };
};

export type SummaryListItem = {
  id: string;
  slug: string;
  book_title_ar: string;
  book_title_en: string | null;
  author: string | null;
  cover_url: string | null;
  category_id: string | null;
  reading_minutes: number | null;
  published_at: string | null;
  /** نسخة عمومية من s10.value — الرقم وحده بلا مبرّرات.
      يُملأ بمشغّل في Postgres عند أي كتابة على content_full. */
  rating_value: number | null;
  content_free: ContentFree;
};

export type Summary = SummaryListItem & {
  status: "draft" | "published";
  content_full?: ContentFull | null;
};

export const LIST_COLUMNS =
  "id, slug, book_title_ar, book_title_en, author, cover_url, category_id, reading_minutes, published_at, rating_value, content_free";
