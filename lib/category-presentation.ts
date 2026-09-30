// lib/category-presentation.ts — طبقة تحريرية مشتركة لصفحات الأقسام
// الهيكل لا يعتمد على عدد الأقسام. أي قسم جديد يعمل تلقائياً عبر fallback.
export const CATEGORY_QUESTIONS: Record<string, string> = {
  leadership:       'كيف تقود بوضوح عندما تصبح القرارات أصعب؟',
  entrepreneurship: 'كيف تبني شيئًا يريده الناس ويستحق أن ينمو؟',
  productivity:     'كيف تنجز باستمرار دون أن تستنزف نفسك؟',
  strategy:         'كيف ترى الصورة الأكبر قبل أن تختار خطوتك التالية؟',
  teams:            'كيف تبني فريقًا أفضل، وثقافة تساعده على النجاح؟',
  business:         'كيف تتخذ قرارات مالية وتجارية بوعي أكبر؟',
}

export function categoryQuestion(slug: string, name: string, description?: string | null) {
  return CATEGORY_QUESTIONS[slug] || description || `ما الذي تريد أن تطوّره في ${name}؟`
}
