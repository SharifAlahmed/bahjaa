// components/bahjaa/today-action.tsx — «خطوة بهجة لهذا اليوم»
// خلفية paper-2 لا deep: اللوحة الداكنة الوحيدة في صفحة الملخص محجوزة للفكرة المحورية.
import type { ReactNode } from 'react'

export function TodayAction({
  task,
  minutes = 20,
  primary,
  secondary,
}: {
  task: string
  minutes?: number
  primary?: ReactNode
  secondary?: ReactNode
}) {
  const AR = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩']
  const n = String(minutes).replace(/[0-9]/g, (d) => AR[Number(d)])

  return (
    <section className="today" id="today-action" aria-labelledby="today-title">
      <p className="eyebrow">من مسار التطبيق — مفتوح لك كعيّنة</p>
      <h2 id="today-title">خطوة بهجة لهذا اليوم</h2>
      <p className="task">{task}</p>
      <p className="facts"><span>المدة: <b>{n} دقيقة</b></span></p>
      {(primary || secondary) && (
        <div className="actions">
          {primary}
          {secondary}
        </div>
      )}
    </section>
  )
}
