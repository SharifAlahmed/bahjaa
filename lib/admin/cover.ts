// أغلفة الملخصات: المسارات والتحقق. الغلاف يُدار مباشرة على صف bh_summaries (لا عبر مسودة النص).
import { uniqueObjectName, type ImageRules } from "./media";

export const COVER_BUCKET = "bh-covers";

export const COVER_RULES: ImageRules = {
  mimeTypes: ["image/jpeg", "image/png", "image/webp"],
  maxBytes: 2 * 1024 * 1024,
  minWidth: 400,
  minHeight: 600,
  aspect: {
    min: 0.55,
    max: 0.8,
    hint: "شكل الصورة بعيد عن نسبة غلاف الكتاب المعتادة (عرض اثنين إلى ارتفاع ثلاثة تقريباً)، وقد تُقصّ أطرافها عند العرض. يمكنك المتابعة.",
  },
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const VERSIONED_FILE = /^[0-9]{13}-[a-z0-9]{8}\.(jpg|png|webp)$/;
const LEGACY_EXT = /^(jpe?g|png|webp)$/;

/** مسار فريد داخل مجلد الملخص: <summary-id>/<timestamp>-<random>.<ext> */
export function coverObjectPath(summaryId: string, mimeType: string, now: number, random: string): string {
  if (!UUID.test(summaryId)) throw new Error("bad summary id");
  return `${summaryId}/${uniqueObjectName(mimeType, now, random)}`;
}

const publicPrefix = (supabaseUrl: string) =>
  `${supabaseUrl.replace(/\/+$/, "")}/storage/v1/object/public/${COVER_BUCKET}/`;

export function coverPublicUrl(supabaseUrl: string, objectPath: string): string {
  return publicPrefix(supabaseUrl) + objectPath;
}

/**
 * يعيد مسار الكائن داخل bh-covers إن كان الرابط يخص هذا الملخص نفسه، وإلا null.
 * المقبول: <id>/<timestamp>-<random>.<ext> (الخطوة ٤) أو الملف القديم <id>.<ext> قبلها.
 * أي رابط خارجي، أو بكت آخر، أو مجلد ملخص آخر، أو رابط فيه استعلام/مسار نسبي: مرفوض.
 */
export function ownCoverObjectPath(url: unknown, supabaseUrl: string, summaryId: string): string | null {
  if (typeof url !== "string" || !UUID.test(summaryId)) return null;
  const prefix = publicPrefix(supabaseUrl);
  if (!url.startsWith(prefix)) return null;
  const rest = url.slice(prefix.length);
  if (rest.startsWith(`${summaryId}/`)) {
    return VERSIONED_FILE.test(rest.slice(summaryId.length + 1)) ? rest : null;
  }
  if (rest.startsWith(`${summaryId}.`)) {
    return LEGACY_EXT.test(rest.slice(summaryId.length + 1)) ? rest : null;
  }
  return null;
}

/** الأغلفة السابقة: روابط مميّزة من سجل النسخ (الأحدث أولاً)، تخص هذا الملخص، وغير الغلاف الحالي */
export function previousCovers(
  historical: (string | null | undefined)[], current: string | null, supabaseUrl: string, summaryId: string,
): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const url of historical) {
    if (!url || url === current || seen.has(url)) continue;
    seen.add(url);
    if (ownCoverObjectPath(url, supabaseUrl, summaryId)) out.push(url);
  }
  return out;
}
