// lib/admin/summary-content.ts — عقد محرّر الملخصات (Admin v1 · الخطوة ٢)
// خريطة الحقول + الدمج + التحقق. يُستخدم في النموذج (المتصفح) وفي الخادم بالمنطق نفسه.
// الشكل مطابق لـ lib/types.ts حرفياً. الدمج يبدأ من JSON المخزَّن ويستبدل الحقول المعروفة فقط،
// فلا يُسقط أي حقل إضافي على أي مستوى.

/** حد حجم المحتوى (content_free + content_full) بالبايت.
    أكبر ملخص حالي ٣١٬٧١١ بايت، وحد طلب Server Action في Next هو ١ ميغابايت (الافتراضي).
    ٢٥٦ ك.ب ≈ ٨ أضعاف الأكبر وربع حد الطلب. */
export const MAX_CONTENT_BYTES = 256 * 1024;
export const MAX_LIST_ITEMS = 40;
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const SLUG_MAX = 80;
export const TITLE_MAX = 200;
export const MINUTES_MIN = 1;
export const MINUTES_MAX = 120;

type Json = Record<string, unknown>;

export type SectionId =
  | "basic" | "s1" | "s2" | "s3" | "s4" | "s5" | "s6" | "s7" | "s8" | "s9" | "s10";

export type Issue = { field: string; section: SectionId; message: string };

export type PillarItem = {
  /** موضع العنصر في المصفوفة المخزَّنة؛ null لعنصر جديد. به تُحفظ الحقول الإضافية عند إعادة الترتيب */
  src: number | null;
  title: string; essence: string; why_you: string; common_trap: string;
};
export type QuoteItem = { src: number | null; quote: string; interpretation: string };

export type EditorValues = {
  meta: {
    slug: string; book_title_ar: string; book_title_en: string;
    author: string; category_id: string; reading_minutes: string;
  };
  s1: { problem: string; core_idea: string; best_for: string; not_for: string; verdict: string };
  s2: { text: string };
  s3: { questions: string[]; bridge: string; gains: string; author_note: string };
  s4: { text: string };
  s5: PillarItem[];
  s6: QuoteItem[];
  s7: { context: string; situation: string; decision: string; result: string; lesson: string };
  s8: { diagnosis: string; zero_step: string; week_plan: string[]; team_question: string; success_marker: string };
  s9: { liked: string; wished: string; arab_context: string };
  s10: {
    value: string; applicability: string; depth: string;
    j_value: string; j_applicability: string; j_depth: string;
  };
};

export type StoredSummary = {
  slug: string;
  book_title_ar: string;
  book_title_en: string | null;
  author: string | null;
  category_id: string | null;
  reading_minutes: number | null;
  content_free: unknown;
  content_full: unknown;
};

/** عناوين الأقسام — نفسها التي يعرضها قارئ الملخص */
export const SECTIONS: { id: SectionId; n: number | null; title: string }[] = [
  { id: "basic", n: null, title: "المعلومات الأساسية" },
  { id: "s1", n: 1, title: "ملخص الـ٣٠ ثانية" },
  { id: "s2", n: 2, title: "لحظة التعرّف" },
  { id: "s3", n: 3, title: "لماذا هذا الكتاب الآن؟" },
  { id: "s4", n: 4, title: "الفكرة المحورية" },
  { id: "s5", n: 5, title: "المحاور الكاملة للكتاب" },
  { id: "s6", n: 6, title: "الاقتباسات الذهبية" },
  { id: "s7", n: 7, title: "مثال واقعي من بيئة الأعمال" },
  { id: "s8", n: 8, title: "مسار التحويل" },
  { id: "s9", n: 9, title: "رؤية فريق بهجة النقدية" },
  { id: "s10", n: 10, title: "تقييم فريق بهجة" },
];

/** حقول النص في الأقسام الكائنية: [المفتاح، التسمية، عدد أسطر الحقل] */
export const TEXT_FIELDS = {
  s1: [
    ["problem", "المشكلة التي يحلها هذا الكتاب", 3],
    ["core_idea", "الفكرة الجوهرية للكتاب", 3],
    ["best_for", "من سيستفيد أكثر من هذا الكتاب", 3],
    ["not_for", "من قد لا يجد فيه ما يبحث عنه", 3],
    ["verdict", "حكم فريق بهجة", 3],
  ],
  s2: [["text", "نص لحظة التعرّف", 8]],
  s3: [
    ["bridge", "الجسر بين الأسئلة والكتاب", 4],
    ["gains", "ما الذي ستخرج به؟", 4],
    ["author_note", "ملاحظة عن المؤلف", 3],
  ],
  s4: [["text", "الجملة المحورية", 5]],
  s7: [
    ["context", "السياق", 3],
    ["situation", "الموقف", 3],
    ["decision", "القرار", 3],
    ["result", "النتيجة", 3],
    ["lesson", "الدرس", 3],
  ],
  s8a: [
    ["diagnosis", "التشخيص", 3],
    ["zero_step", "الخطوة الصفرية", 3],
  ],
  s8b: [
    ["team_question", "السؤال المحوري", 3],
    ["success_marker", "مؤشر النجاح بعد ٣٠ يومًا", 3],
  ],
  s9: [
    ["liked", "ما أعجبنا فعلاً", 4],
    ["wished", "ما كنا نتمنى أن يقوله المؤلف", 4],
    ["arab_context", "الربط بالسياق العربي والخليجي", 4],
  ],
} as const;

export const PILLAR_FIELDS = [
  ["title", "عنوان المحور", 1],
  ["essence", "جوهر المحور", 5],
  ["why_you", "لماذا يهمك مباشرةً", 3],
  ["common_trap", "الفخ الشائع (اختياري)", 3],
] as const;

export const QUOTE_FIELDS = [
  ["quote", "الاقتباس", 3],
  ["interpretation", "تفسير فريق بهجة", 3],
] as const;

export const SCORE_FIELDS = [
  ["value", "j_value", "القيمة للقائد المشغول"],
  ["applicability", "j_applicability", "قابلية التطبيق الفوري"],
  ["depth", "j_depth", "عمق الأفكار"],
] as const;

/** توصيات ناعمة لأعداد القوائم — لا تمنع الحفظ ولا النشر */
export const LIST_HINTS = {
  questions: { min: 3, max: 3, text: "الموصى به: ٣ أسئلة" },
  week_plan: { min: 3, max: 3, text: "الموصى به: ٣ خطوات" },
  s5: { min: 4, max: 7, text: "المعتاد: من ٤ إلى ٧ محاور" },
  s6: { min: 3, max: 5, text: "المعتاد: من ٣ إلى ٥ اقتباسات" },
} as const;

// ── أدوات ────────────────────────────────────────────────────
const isObj = (v: unknown): v is Json => !!v && typeof v === "object" && !Array.isArray(v);
const obj = (v: unknown): Json => (isObj(v) ? v : {});
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const str = (v: unknown): string => (typeof v === "string" ? v : "");
const norm = (s: string): string => s.replace(/\r\n?/g, "\n");
/** أرقام عربية هندية لرسائل الواجهة (نسخة محلية ليبقى الملف بلا تبعيات) */
const ar = (n: number): string => String(n).replace(/[0-9]/g, (d) => "٠١٢٣٤٥٦٧٨٩"[+d]);

export function byteLength(value: unknown): number {
  return new TextEncoder().encode(JSON.stringify(value)).length;
}

// ── من الصف المخزَّن إلى قيم النموذج ─────────────────────────
export function toEditorValues(row: StoredSummary): EditorValues {
  const f = obj(row.content_free);
  const u = obj(row.content_full);
  const s1 = obj(f.s1), s2 = obj(f.s2), s3 = obj(f.s3), s4 = obj(f.s4);
  const s7 = obj(u.s7), s8 = obj(u.s8), s9 = obj(u.s9), s10 = obj(u.s10);
  const just = obj(s10.justifications);
  const score = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? String(v) : "");
  return {
    meta: {
      slug: row.slug ?? "",
      book_title_ar: row.book_title_ar ?? "",
      book_title_en: row.book_title_en ?? "",
      author: row.author ?? "",
      category_id: row.category_id ?? "",
      reading_minutes: row.reading_minutes == null ? "" : String(row.reading_minutes),
    },
    s1: {
      problem: str(s1.problem), core_idea: str(s1.core_idea), best_for: str(s1.best_for),
      not_for: str(s1.not_for), verdict: str(s1.verdict),
    },
    s2: { text: str(s2.text) },
    s3: {
      questions: arr(s3.questions).map(str),
      bridge: str(s3.bridge), gains: str(s3.gains), author_note: str(s3.author_note),
    },
    s4: { text: str(s4.text) },
    s5: arr(u.s5).map((it, i) => {
      const o = obj(it);
      return {
        src: i, title: str(o.title), essence: str(o.essence),
        why_you: str(o.why_you), common_trap: str(o.common_trap),
      };
    }),
    s6: arr(u.s6).map((it, i) => {
      const o = obj(it);
      return { src: i, quote: str(o.quote), interpretation: str(o.interpretation) };
    }),
    s7: {
      context: str(s7.context), situation: str(s7.situation), decision: str(s7.decision),
      result: str(s7.result), lesson: str(s7.lesson),
    },
    s8: {
      diagnosis: str(s8.diagnosis), zero_step: str(s8.zero_step),
      week_plan: arr(s8.week_plan).map(str),
      team_question: str(s8.team_question), success_marker: str(s8.success_marker),
    },
    s9: { liked: str(s9.liked), wished: str(s9.wished), arab_context: str(s9.arab_context) },
    s10: {
      value: score(s10.value), applicability: score(s10.applicability), depth: score(s10.depth),
      j_value: str(just.value), j_applicability: str(just.applicability), j_depth: str(just.depth),
    },
  };
}

// ── تطهير ما يصل من المتصفح (غير موثوق) ──────────────────────
/** يعيد قيماً سليمة الشكل، أو null إن كان المُدخل ليس نموذج محرّر أصلاً */
export function parseEditorValues(input: unknown): EditorValues | null {
  if (!isObj(input)) return null;
  const need = ["meta", "s1", "s2", "s3", "s4", "s7", "s8", "s9", "s10"];
  if (need.some((k) => !isObj(input[k]))) return null;
  if (!Array.isArray(input.s5) || !Array.isArray(input.s6)) return null;
  const pick = <K extends string>(o: unknown, keys: readonly K[]): Record<K, string> => {
    const src = obj(o);
    const out = {} as Record<K, string>;
    for (const k of keys) out[k] = norm(str(src[k]));
    return out;
  };
  const list = (v: unknown): string[] | null => {
    if (!Array.isArray(v) || v.length > MAX_LIST_ITEMS) return null;
    return v.map((x) => norm(str(x)));
  };
  const srcOf = (v: unknown): number | null =>
    typeof v === "number" && Number.isInteger(v) && v >= 0 ? v : null;

  const s3 = obj(input.s3), s8 = obj(input.s8);
  const questions = list(s3.questions), weekPlan = list(s8.week_plan);
  if (!questions || !weekPlan) return null;
  if (input.s5.length > MAX_LIST_ITEMS || input.s6.length > MAX_LIST_ITEMS) return null;

  return {
    meta: pick(input.meta, ["slug", "book_title_ar", "book_title_en", "author", "category_id", "reading_minutes"] as const),
    s1: pick(input.s1, ["problem", "core_idea", "best_for", "not_for", "verdict"] as const),
    s2: pick(input.s2, ["text"] as const),
    s3: { questions, ...pick(s3, ["bridge", "gains", "author_note"] as const) },
    s4: pick(input.s4, ["text"] as const),
    s5: input.s5.map((it) => ({
      src: srcOf(obj(it).src),
      ...pick(it, ["title", "essence", "why_you", "common_trap"] as const),
    })),
    s6: input.s6.map((it) => ({
      src: srcOf(obj(it).src),
      ...pick(it, ["quote", "interpretation"] as const),
    })),
    s7: pick(input.s7, ["context", "situation", "decision", "result", "lesson"] as const),
    s8: {
      ...pick(s8, ["diagnosis", "zero_step"] as const),
      week_plan: weekPlan,
      ...pick(s8, ["team_question", "success_marker"] as const),
    },
    s9: pick(input.s9, ["liked", "wished", "arab_context"] as const),
    s10: pick(input.s10, ["value", "applicability", "depth", "j_value", "j_applicability", "j_depth"] as const),
  };
}

// ── الدمج: يبدأ من المخزَّن ويستبدل الحقول المعروفة فقط ───────
/** حقل كان غائباً وبقي فارغاً يبقى غائباً؛ حقل كان موجوداً وأُفرغ يُحفظ نصاً فارغاً */
function mergeTexts(original: unknown, texts: Record<string, string>): Json {
  const base = obj(original);
  const out: Json = { ...base };
  for (const [k, v] of Object.entries(texts)) {
    if (v === "" && !(k in base)) continue;
    out[k] = norm(v);
  }
  return out;
}

/** قسم كان غائباً وبقي فارغاً لا يُنشأ */
function put(target: Json, original: Json, key: string, value: Json | unknown[]) {
  const empty = Array.isArray(value) ? value.length === 0 : Object.keys(value).length === 0;
  if (empty && !(key in original)) return;
  target[key] = value;
}

export function mergeContent(
  originalFree: unknown,
  originalFull: unknown,
  v: EditorValues,
): { content_free: Json; content_full: Json } {
  const of = obj(originalFree);
  const ou = obj(originalFull);
  const free: Json = { ...of };
  const full: Json = { ...ou };

  put(free, of, "s1", mergeTexts(of.s1, v.s1));
  put(free, of, "s2", mergeTexts(of.s2, v.s2));
  {
    const base = obj(of.s3);
    const s3 = mergeTexts(base, { bridge: v.s3.bridge, gains: v.s3.gains, author_note: v.s3.author_note });
    if (v.s3.questions.length || "questions" in base) s3.questions = v.s3.questions.map(norm);
    put(free, of, "s3", s3);
  }
  put(free, of, "s4", mergeTexts(of.s4, v.s4));

  {
    const orig = arr(ou.s5);
    const items = v.s5.map((it) =>
      mergeTexts(it.src !== null ? orig[it.src] : undefined, {
        title: it.title, essence: it.essence, why_you: it.why_you, common_trap: it.common_trap,
      }));
    put(full, ou, "s5", items);
  }
  {
    const orig = arr(ou.s6);
    const items = v.s6.map((it) =>
      mergeTexts(it.src !== null ? orig[it.src] : undefined, {
        quote: it.quote, interpretation: it.interpretation,
      }));
    put(full, ou, "s6", items);
  }
  put(full, ou, "s7", mergeTexts(ou.s7, v.s7));
  {
    const base = obj(ou.s8);
    const s8 = mergeTexts(base, {
      diagnosis: v.s8.diagnosis, zero_step: v.s8.zero_step,
      team_question: v.s8.team_question, success_marker: v.s8.success_marker,
    });
    if (v.s8.week_plan.length || "week_plan" in base) s8.week_plan = v.s8.week_plan.map(norm);
    put(full, ou, "s8", s8);
  }
  put(full, ou, "s9", mergeTexts(ou.s9, v.s9));
  {
    const base = obj(ou.s10);
    const s10: Json = { ...base };
    for (const key of ["value", "applicability", "depth"] as const) {
      const raw = v.s10[key].trim();
      if (raw === "") delete s10[key];          // إفراغ الدرجة يزيل الرقم (لا يوجد «رقم فارغ»)
      else s10[key] = Number(raw);
    }
    const just = mergeTexts(base.justifications, {
      value: v.s10.j_value, applicability: v.s10.j_applicability, depth: v.s10.j_depth,
    });
    if (Object.keys(just).length || "justifications" in base) s10.justifications = just;
    put(full, ou, "s10", s10);
  }
  return { content_free: free, content_full: full };
}

// ── التحقق ───────────────────────────────────────────────────
/** أخطاء مانعة — نفسها للحفظ وللنشر */
export function validateValues(v: EditorValues, categoryIds: readonly string[] | null): Issue[] {
  const errors: Issue[] = [];
  const add = (field: string, section: SectionId, message: string) => errors.push({ field, section, message });

  const slug = v.meta.slug;
  if (!slug) add("meta.slug", "basic", "المسار مطلوب.");
  else if (slug.length > SLUG_MAX) add("meta.slug", "basic", "المسار أطول من ٨٠ حرفاً.");
  else if (!SLUG_PATTERN.test(slug))
    add("meta.slug", "basic", "المسار: أحرف إنجليزية صغيرة وأرقام وشرطات فقط، مثل atomic-habits.");

  if (!v.meta.book_title_ar.trim()) add("meta.book_title_ar", "basic", "العنوان العربي مطلوب.");
  else if (v.meta.book_title_ar.length > TITLE_MAX) add("meta.book_title_ar", "basic", "العنوان أطول من ٢٠٠ حرف.");
  if (v.meta.book_title_en.length > TITLE_MAX) add("meta.book_title_en", "basic", "العنوان أطول من ٢٠٠ حرف.");
  if (v.meta.author.length > TITLE_MAX) add("meta.author", "basic", "اسم المؤلف أطول من ٢٠٠ حرف.");

  if (!v.meta.category_id) add("meta.category_id", "basic", "اختر قسماً.");
  else if (categoryIds && !categoryIds.includes(v.meta.category_id))
    add("meta.category_id", "basic", "القسم المختار غير موجود.");

  const minutes = v.meta.reading_minutes.trim();
  if (!/^\d+$/.test(minutes) || Number(minutes) < MINUTES_MIN || Number(minutes) > MINUTES_MAX)
    add("meta.reading_minutes", "basic", "مدة القراءة: رقم صحيح بين ١ و١٢٠ دقيقة.");

  for (const key of ["value", "applicability", "depth"] as const) {
    const raw = v.s10[key].trim();
    if (raw !== "" && (!/^\d+$/.test(raw) || Number(raw) > 10))
      add(`s10.${key}`, "s10", "الدرجة: رقم صحيح من ٠ إلى ١٠.");
  }
  return errors;
}

/** ملاحظات اكتمال وتوصيات أعداد — لا تمنع الحفظ ولا النشر */
export function completenessWarnings(v: EditorValues): Issue[] {
  const out: Issue[] = [];
  const add = (field: string, section: SectionId, message: string) => out.push({ field, section, message });
  const texts = (section: SectionId, values: Record<string, string>, defs: readonly (readonly [string, string, number])[]) => {
    for (const [key, label] of defs) if (!values[key]?.trim()) add(`${section}.${key}`, section, `«${label}» فارغ.`);
  };
  texts("s1", v.s1, TEXT_FIELDS.s1);
  texts("s2", v.s2, TEXT_FIELDS.s2);
  texts("s3", v.s3 as unknown as Record<string, string>, TEXT_FIELDS.s3);
  texts("s4", v.s4, TEXT_FIELDS.s4);
  texts("s7", v.s7, TEXT_FIELDS.s7);
  texts("s8", v.s8 as unknown as Record<string, string>, [...TEXT_FIELDS.s8a, ...TEXT_FIELDS.s8b]);
  texts("s9", v.s9, TEXT_FIELDS.s9);

  const count = (field: string, section: SectionId, n: number, hint: { min: number; max: number; text: string }) => {
    if (n < hint.min || n > hint.max) add(field, section, `${hint.text} (الموجود الآن: ${ar(n)}).`);
  };
  count("s3.questions", "s3", v.s3.questions.length, LIST_HINTS.questions);
  count("s8.week_plan", "s8", v.s8.week_plan.length, LIST_HINTS.week_plan);
  count("s5", "s5", v.s5.length, LIST_HINTS.s5);
  count("s6", "s6", v.s6.length, LIST_HINTS.s6);

  v.s3.questions.forEach((q, i) => { if (!q.trim()) add(`s3.questions.${i}`, "s3", `السؤال ${ar(i + 1)} فارغ.`); });
  v.s8.week_plan.forEach((q, i) => { if (!q.trim()) add(`s8.week_plan.${i}`, "s8", `خطوة الأسبوع ${ar(i + 1)} فارغة.`); });
  v.s5.forEach((p, i) => {
    if (!p.title.trim()) add(`s5.${i}.title`, "s5", `المحور ${ar(i + 1)} بلا عنوان.`);
    if (!p.essence.trim()) add(`s5.${i}.essence`, "s5", `المحور ${ar(i + 1)} بلا جوهر.`);
  });
  v.s6.forEach((q, i) => { if (!q.quote.trim()) add(`s6.${i}.quote`, "s6", `الاقتباس ${ar(i + 1)} فارغ.`); });
  for (const [key, jkey, label] of SCORE_FIELDS) {
    if (!v.s10[key].trim()) add(`s10.${key}`, "s10", `درجة «${label}» فارغة.`);
    if (!v.s10[jkey].trim()) add(`s10.${jkey}`, "s10", `مبرّر «${label}» فارغ.`);
  }
  return out;
}

/** فحص أنواع JSON المخزَّن نفسه — يلتقط ما لا يظهر في قيم النموذج (نوع خاطئ لحاوية أو حقل) */
export function structuralIssues(contentFree: unknown, contentFull: unknown): Issue[] {
  const out: Issue[] = [];
  const add = (field: string, section: SectionId, what: string) =>
    out.push({ field, section, message: `شكل البيانات المخزَّنة غير متوقع: ${what}.` });
  if (!isObj(contentFree)) add("s1", "s1", "content_free ليس كائناً");
  if (!isObj(contentFull)) add("s5", "s5", "content_full ليس كائناً");
  const f = obj(contentFree), u = obj(contentFull);

  const objSection = (holder: Json, id: SectionId, textKeys: readonly string[]) => {
    if (!(id in holder)) return;
    if (!isObj(holder[id])) return add(id, id, `${id} ليس كائناً`);
    const o = obj(holder[id]);
    for (const k of textKeys) if (k in o && typeof o[k] !== "string") add(`${id}.${k}`, id, `${id}.${k} ليس نصاً`);
  };
  const stringList = (holder: Json, id: SectionId, key: string) => {
    const o = obj(holder[id]);
    if (!(key in o)) return;
    if (!Array.isArray(o[key])) return add(`${id}.${key}`, id, `${id}.${key} ليس قائمة`);
    arr(o[key]).forEach((x, i) => { if (typeof x !== "string") add(`${id}.${key}.${i}`, id, `${id}.${key}[${i}] ليس نصاً`); });
  };
  const objList = (id: SectionId, textKeys: readonly string[]) => {
    if (!(id in u)) return;
    if (!Array.isArray(u[id])) return add(id, id, `${id} ليس قائمة`);
    arr(u[id]).forEach((x, i) => {
      if (!isObj(x)) return add(`${id}.${i}`, id, `${id}[${i}] ليس كائناً`);
      for (const k of textKeys) if (k in x && typeof x[k] !== "string") add(`${id}.${i}.${k}`, id, `${id}[${i}].${k} ليس نصاً`);
    });
  };

  objSection(f, "s1", ["problem", "core_idea", "best_for", "not_for", "verdict"]);
  objSection(f, "s2", ["text"]);
  objSection(f, "s3", ["bridge", "gains", "author_note"]);
  stringList(f, "s3", "questions");
  objSection(f, "s4", ["text"]);
  objList("s5", ["title", "essence", "why_you", "common_trap"]);
  objList("s6", ["quote", "interpretation"]);
  objSection(u, "s7", ["context", "situation", "decision", "result", "lesson"]);
  objSection(u, "s8", ["diagnosis", "zero_step", "team_question", "success_marker"]);
  stringList(u, "s8", "week_plan");
  objSection(u, "s9", ["liked", "wished", "arab_context"]);
  if ("s10" in u) {
    if (!isObj(u.s10)) add("s10", "s10", "s10 ليس كائناً");
    else {
      const s10 = obj(u.s10);
      for (const k of ["value", "applicability", "depth"])
        if (k in s10 && !(typeof s10[k] === "number" && Number.isInteger(s10[k]) && (s10[k] as number) >= 0 && (s10[k] as number) <= 10))
          add(`s10.${k}`, "s10", `s10.${k} ليس رقماً صحيحاً من ٠ إلى ١٠`);
      if ("justifications" in s10) {
        if (!isObj(s10.justifications)) add("s10.j_value", "s10", "s10.justifications ليس كائناً");
        else for (const k of ["value", "applicability", "depth"])
          if (k in obj(s10.justifications) && typeof obj(s10.justifications)[k] !== "string")
            add(`s10.j_${k}`, "s10", `s10.justifications.${k} ليس نصاً`);
      }
    }
  }
  return out;
}

export function sizeIssue(contentFree: unknown, contentFull: unknown): Issue | null {
  const bytes = byteLength(contentFree) + byteLength(contentFull);
  if (bytes <= MAX_CONTENT_BYTES) return null;
  return {
    field: "s1", section: "s1",
    message: `حجم المحتوى ${ar(Math.round(bytes / 1024))} ك.ب يتجاوز الحد (${ar(MAX_CONTENT_BYTES / 1024)} ك.ب).`,
  };
}

/** التحقق من الصف المخزَّن كما هو — يُستخدم قبل النشر مباشرة */
export function validateStored(row: StoredSummary, categoryIds: readonly string[] | null): Issue[] {
  const size = sizeIssue(row.content_free, row.content_full);
  return [
    ...validateValues(toEditorValues(row), categoryIds),
    ...structuralIssues(row.content_free, row.content_full),
    ...(size ? [size] : []),
  ];
}
