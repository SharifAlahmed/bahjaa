"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toArabicDigits } from "@/components/bahjaa/format";
import { readReadingState, type ReadingState } from "@/lib/reading-state";

export function ContinueReading() {
  const [state, setState] = useState<ReadingState | null>(null);

  useEffect(() => {
    const current = readReadingState();
    if (current && !current.complete) setState(current);
  }, []);

  if (!state) return null;

  return (
    <section className="hm-continue" aria-labelledby="continue-reading-title">
      <div className="wrap">
        <div className="hm-continue-card">
          <div className="hm-continue-copy">
            <p className="hm-eyebrow">تابع القراءة</p>
            <h2 className="hm-continue-title" id="continue-reading-title">{state.title}</h2>
            <p className="hm-continue-meta">
              توقفت عند القسم {toArabicDigits(state.section)} · {state.sectionName}
            </p>
          </div>
          <Link href={`/s/${state.slug}#sec-${state.section}`} className="btn btn-ghost hm-continue-btn">
            أكمل القراءة
          </Link>
        </div>
      </div>
    </section>
  );
}
