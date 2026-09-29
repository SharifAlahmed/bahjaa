export type ReadingState = {
  slug: string;
  title: string;
  section: number;
  sectionName: string;
  updatedAt: number;
  complete: boolean;
};

export const READING_STATE_KEY = "bahjaa:reading-state";

function isReadingState(value: unknown): value is ReadingState {
  if (!value || typeof value !== "object") return false;
  const v = value as Partial<ReadingState>;
  return (
    typeof v.slug === "string" &&
    typeof v.title === "string" &&
    typeof v.section === "number" &&
    Number.isInteger(v.section) &&
    v.section >= 1 &&
    v.section <= 10 &&
    typeof v.sectionName === "string" &&
    typeof v.updatedAt === "number" &&
    typeof v.complete === "boolean"
  );
}

export function readReadingState(): ReadingState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(READING_STATE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isReadingState(parsed)) {
      window.localStorage.removeItem(READING_STATE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function writeReadingState(next: ReadingState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(READING_STATE_KEY, JSON.stringify(next));
  } catch {
    // التقدّم تحسين اختياري؛ تعذّر التخزين لا يجب أن يعطّل القراءة.
  }
}

export function markReadingComplete(slug: string) {
  const current = readReadingState();
  if (!current || current.slug !== slug) return;
  writeReadingState({ ...current, complete: true, updatedAt: Date.now() });
}
