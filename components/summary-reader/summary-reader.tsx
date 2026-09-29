import type { ReactNode } from "react";
import type { ContentFree, ContentFull } from "@/lib/types";
import { SummaryHero, type HeroData } from "./summary-hero";
import { ReadingNavigator, SECTION_NAMES, type NavState } from "./reading-navigator";
import { ReadingProgress } from "./reading-progress";
import { FreeSections, freePresence } from "./free-sections";
import { FullSections, fullPresence } from "./full-sections";
import { SummaryEnd } from "./summary-end";

/**
 * العارض المشترك بين /s/[slug] و/admin/preview/[slug].
 *
 * أمان: `full` يمرّره الخادم فقط حين يحقّ للقارئ رؤيته (جلسة، أو أدمن).
 * للزائر يكون null، فلا تُبنى الأقسام ٥–١٠ ولا يُرسل منها شيء إلى المتصفح؛
 * المستكشف يأخذ حالات (رابط/مقفول/غائب) لا محتوى. كل المكوّنات هنا خادمية
 * عدا ReadingProgress التي لا تستقبل إلا أسماء الأقسام.
 */
export function SummaryReader({
  hero,
  free,
  full,
  locked,
  access,
  gate,
}: {
  hero: HeroData;
  free: ContentFree;
  full: ContentFull | null;
  /** الزائر بلا جلسة: ٥–١٠ مقفولة في المستكشف ويظهر الجدار */
  locked: boolean;
  access: "open" | "partial" | null;
  /** الجدار (للزائر فقط) — يمرّره الخادم */
  gate?: ReactNode;
}) {
  const fp = freePresence(free);
  const lp = full ? fullPresence(full) : [false, false, false, false, false, false];
  const states: NavState[] = [
    ...fp.map((p) => (p ? "link" : "absent") as NavState),
    ...lp.map((p) => (locked ? "locked" : p ? "link" : "absent") as NavState),
  ];

  return (
    <article className="sr">
      <div className="sr-wrap">
        <SummaryHero d={hero} access={access} />
        {/* عمود القراءة أولاً (يمين في RTL)، والمستكشف عمود ثانوي بجانبه على سطح المكتب */}
        <div className="sr-body">
          <div className="sr-main">
            <ReadingNavigator states={states} locked={locked} mode="mobile" />
            <FreeSections c={free} />
            {full && !locked ? <FullSections c={full} /> : gate}
            <SummaryEnd category={hero.category} reflect={!!full && !locked} />
          </div>
          <aside className="sr-aside">
            <ReadingNavigator states={states} locked={locked} mode="rail" />
          </aside>
        </div>
        <ReadingProgress names={[...SECTION_NAMES]} />
      </div>
    </article>
  );
}
