// components/bahjaa/dark-panel.tsx
// ⚠️ لوحة داكنة واحدة في كل صفحة (بالإضافة إلى الهيدر والتذييل). أكثر من واحدة تُفقدها أثرها.
export function DarkPanel({ eyebrow, statement }: { eyebrow?: string; statement: string }) {
  return (
    <div className="dark-panel">
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <p className="statement" style={{ marginTop: eyebrow ? 16 : 0 }}>{statement}</p>
    </div>
  )
}
