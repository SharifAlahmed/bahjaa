import Link from "next/link";
import { BookCover } from "@/components/BookCover";
import type { CategorySlug } from "@/components/bahjaa/cover";
import { readingLabel, toArabicDigits } from "@/components/bahjaa/format";
import { IconLock, IconUnlock } from "./icons";

export type HeroData = {
  slug: string;
  titleAr: string;
  titleEn?: string | null;
  author?: string | null;
  coverUrl?: string | null;
  readingMinutes?: number | null;
  rating?: number | null;
  category?: { slug: string; name_ar: string } | null;
};

/* ترويسة الملخص: العنوان هو الأولوية، والغلاف أكبر من السابق بنحو الربع.
   بيانات حقيقية فقط — لا عدد صفحات ولا سنة ولا شعبية. */
export function SummaryHero({ d, access }: { d: HeroData; access: "open" | "partial" | null }) {
  const minutes = readingLabel(d.readingMinutes || 8).replace("قراءة ", "");
  return (
    <header className="sr-hero">
      <div className="sr-hero-text">
        {d.category ? (
          <p className="sr-hero-cat">
            <Link href={`/c/${d.category.slug}`}>{d.category.name_ar}</Link>
          </p>
        ) : null}
        <h1 className="sr-hero-title">{d.titleAr}</h1>
        {d.titleEn ? (
          <p className="sr-hero-en" dir="ltr" lang="en">{d.titleEn}</p>
        ) : null}
        {d.author ? <p className="sr-hero-author">{d.author}</p> : null}
        <p className="sr-hero-meta">
          <span>{minutes}</span>
          {typeof d.rating === "number" ? (
            <span>تقييم بهجة {toArabicDigits(d.rating)}/١٠</span>
          ) : null}
        </p>
        {access ? (
          <p className="sr-hero-access">
            {access === "open" ? <IconUnlock size={16} /> : <IconLock size={16} />}
            {access === "open" ? "الملخص كاملاً مفتوح لك" : "أول ٤ أقسام مفتوحة للجميع"}
          </p>
        ) : null}
      </div>
      <div className="sr-hero-cover">
        <BookCover
          title={d.titleAr}
          author={d.author}
          coverUrl={d.coverUrl}
          size="hero"
          priority
          slug={d.slug}
          category={(d.category?.slug || "leadership") as CategorySlug}
          categoryLabel={d.category?.name_ar || "بهجة"}
        />
      </div>
    </header>
  );
}
