#!/usr/bin/env node
/**
 * بهجة — مولّد الأغلفة التوليدية
 * scripts/generate-covers.mjs
 *
 * يولّد غلاف PNG لكل ملخص من ثلاث قيم فقط: لون القسم، اسم الكتاب، سطر التسمية.
 * لا صور كتب، لا تراخيص.
 *
 * التشغيل:
 *   node scripts/generate-covers.mjs                     # يسحب من Supabase وينتج كل الأغلفة الناقصة
 *   node scripts/generate-covers.mjs --force             # يعيد توليد كل شيء
 *   node scripts/generate-covers.mjs --slug lean-startup # غلاف واحد
 *   node scripts/generate-covers.mjs --data books.json   # من ملف بدل Supabase
 *   node scripts/generate-covers.mjs --out public/covers --width 1200
 *
 * المتطلبات:  npm i -D playwright @fontsource/amiri @fontsource/ibm-plex-sans-arabic
 *             npx playwright install chromium
 */

import { chromium } from 'playwright'
import { readFile, writeFile, mkdir, access } from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'

const require = createRequire(import.meta.url)

// ── إعدادات ───────────────────────────────────────────────────
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
  || 'https://scphugdmnpmmiaxvvhma.supabase.co'
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  || 'sb_publishable_fGWR88iL1EhyufGgnXmTrg_FnfXxOLJ'

// ⚠️ اللوحة الرسمية — مطابقة لـ app/globals.css (--cat-*-field / --cat-*-accent)
const CATEGORY = {
  leadership:       { field: '#15332A', accent: '#C99A45' },
  entrepreneurship: { field: '#15332A', accent: '#3ED69F' },
  productivity:     { field: '#15332A', accent: '#1D9E75' },
  strategy:         { field: '#0B1412', accent: '#C99A45' },
  teams:            { field: '#0B1412', accent: '#3ED69F' },
  business:         { field: '#0B1412', accent: '#1D9E75' },
}

const PAPER = '#F7F5EE'

// ⚠️ نسخة مطابقة من lib/seal.ts — المصدر الوحيد للحقيقة هناك.
// أي تعديل على هندسة الخَتْم يُنسخ إلى هذا الموضع.
function sealHash(slug) {
  let h = 2166136261
  for (let i = 0; i < slug.length; i++) { h ^= slug.charCodeAt(i); h = Math.imul(h, 16777619) }
  return h >>> 0
}
const pickBit = (h, shift, n) => ((h >>> shift) & 0xff) % n
const gcd = (a, b) => (b ? gcd(b, a % b) : a)

function seal(slug) {
  const h = sealHash(slug)
  const N = 9 + pickBit(h, 0, 4) * 2
  let step = 3 + pickBit(h, 8, Math.floor(N / 2) - 2)
  while (gcd(step, N) !== 1) step++
  const R = 58
  let d = ''
  for (let i = 0, seen = 0; seen < N; seen++, i = (i + step) % N) {
    const a = (i * 2 * Math.PI) / N - Math.PI / 2
    d += (seen === 0 ? 'M' : 'L') + (R * Math.cos(a)).toFixed(1) + ' ' + (R * Math.sin(a)).toFixed(1) + ' '
  }
  return { d: d + 'Z', inner: 20 + pickBit(h, 16, 14) }
}

// ── وسائط سطر الأوامر ─────────────────────────────────────────
const argv = process.argv.slice(2)
const arg = (name, fallback) => {
  const i = argv.indexOf(`--${name}`)
  return i === -1 ? fallback : argv[i + 1]
}
const has = (name) => argv.includes(`--${name}`)

const OUT_DIR   = arg('out', 'public/covers')
const WIDTH     = Number(arg('width', 1200))
// ⚠️ المواصفة تعطي رقمين مختلفين: بطاقة الويب بنسبة 3:4، والتصدير 1200×1500 (أي 4:5).
// 4:5 هو المقاس الصحيح لمنشور لينكدإن الرأسي، فهو الافتراضي هنا.
// للحصول على 3:4 المطابق لبطاقة الويب:  --height 1600
const HEIGHT    = Number(arg('height', Math.round(WIDTH * 5 / 4)))
const ONE_SLUG  = arg('slug', null)
const DATA_FILE = arg('data', null)
const FORCE     = has('force')

// عرض الغلاف المرجعي على الويب — كل المقاسات تتدرّج منه
const BASE_WIDTH = 360
const SCALE = WIDTH / BASE_WIDTH

// ── حجم اسم الكتاب ────────────────────────────────────────────
// المواصفة: 46px لكلمتين · 30px لعنوان طويل. التدرّج محسوب على عدد الحروف،
// لأن العربية تتفاوت كثيراً في طول الكلمة.
function coverTitleSize(title) {
  const len = title.trim().length
  if (len <= 14) return 40
  if (len <= 20) return 34
  return 29
}

// ── الخطوط: تُدمج كـ data URI ليعمل السكربت بلا شبكة ──────────
async function fontFaces() {
  const files = [
    ['Amiri', 700, require.resolve('@fontsource/amiri/files/amiri-arabic-700-normal.woff2')],
    ['IBM Plex Sans Arabic', 400, require.resolve('@fontsource/ibm-plex-sans-arabic/files/ibm-plex-sans-arabic-arabic-400-normal.woff2')],
  ]
  const faces = []
  for (const [family, weight, file] of files) {
    const b64 = (await readFile(file)).toString('base64')
    faces.push(`@font-face{font-family:'${family}';font-weight:${weight};font-style:normal;font-display:block;src:url(data:font/woff2;base64,${b64}) format('woff2');}`)
  }
  return faces.join('\n')
}

// ── قالب الغلاف — مطابق لمكوّن Cover.tsx ──────────────────────
function coverHTML(book, faces) {
  const c = CATEGORY[book.category] || CATEGORY.leadership
  const sl = seal(book.slug)
  const px = (n) => `${Math.round(n * SCALE)}px`
  const titlePx = `${Math.round(coverTitleSize(book.title) * SCALE)}px`
  const sealPx = Math.round(148 * SCALE)

  return `<!doctype html><html dir="rtl" lang="ar"><head><meta charset="utf-8">
<style>
${faces}
*{box-sizing:border-box;margin:0;padding:0;}
html,body{width:${WIDTH}px;height:${HEIGHT}px;background:transparent;}
.cover{
  width:${WIDTH}px;height:${HEIGHT}px;background:${c.field};
  padding:${px(28)} ${px(24)};
  display:flex;flex-direction:column;border-radius:0;overflow:hidden;
}
.seal{width:${sealPx}px;height:${sealPx}px;margin-inline-start:${px(-4)};margin-top:${px(2)};flex:none;color:${c.accent};}
.foot{margin-top:auto;}
.rule{width:${px(30)};height:${Math.max(2, Math.round(2 * SCALE))}px;background:${c.accent};}
.title{
  font-family:'Amiri',serif;font-weight:700;color:${PAPER};
  font-size:${titlePx};line-height:1.4;margin-top:${px(16)};
  text-wrap:balance;
}
.label{
  margin-top:${px(16)};font-family:'IBM Plex Sans Arabic',sans-serif;font-weight:400;
  font-size:${px(11)};letter-spacing:${px(1.6)};line-height:1.6;
  color:rgba(247,245,238,.6);
}
</style></head><body>
<div class="cover">
  <svg class="seal" viewBox="-74 -74 148 148" fill="none">
    <circle r="68" stroke="currentColor" stroke-opacity=".28" stroke-width="1"/>
    <path d="${sl.d}" stroke="currentColor" stroke-width="1.15" stroke-linejoin="round"/>
    <circle r="${sl.inner}" stroke="currentColor" stroke-opacity=".55" stroke-width="1"/>
  </svg>
  <div class="foot">
    <div class="rule"></div>
    <h1 class="title">${escapeHtml(book.title)}</h1>
    <p class="label">بهجة · ${escapeHtml(book.categoryLabel)}</p>
  </div>
</div>
</body></html>`
}

const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) =>
  ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]))

// ── مصدر البيانات ─────────────────────────────────────────────
async function loadBooks() {
  if (DATA_FILE) {
    return JSON.parse(await readFile(DATA_FILE, 'utf8'))
  }

  const headers = { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }

  const cats = await fetch(`${SUPABASE_URL}/rest/v1/bh_categories?select=id,slug,name_ar`, { headers })
  if (!cats.ok) throw new Error(`تعذّر جلب الأقسام: ${cats.status} ${await cats.text()}`)
  const catById = Object.fromEntries((await cats.json()).map((c) => [c.id, c]))

  const sums = await fetch(`${SUPABASE_URL}/rest/v1/bh_summaries?select=slug,book_title_ar,category_id`, { headers })
  if (!sums.ok) throw new Error(`تعذّر جلب الملخصات: ${sums.status} ${await sums.text()}`)

  return (await sums.json()).map((s) => {
    const c = catById[s.category_id]
    return {
      slug: s.slug,
      title: s.book_title_ar,
      category: c?.slug ?? 'leadership',
      categoryLabel: c?.name_ar ?? '',
    }
  })
}

// ── التنفيذ ───────────────────────────────────────────────────
const exists = (p) => access(p).then(() => true, () => false)

async function main() {
  let books = await loadBooks()
  if (ONE_SLUG) books = books.filter((b) => b.slug === ONE_SLUG)
  if (!books.length) { console.error('لا يوجد ما يُولَّد.'); process.exit(1) }

  await mkdir(OUT_DIR, { recursive: true })
  const faces = await fontFaces()

  const browser = await chromium.launch(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {})
  const page = await browser.newPage({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
  })

  let made = 0, skipped = 0
  for (const book of books) {
    const file = path.join(OUT_DIR, `${book.slug}.png`)
    if (!FORCE && await exists(file)) { skipped++; console.log(`تخطّي  ${book.slug}`); continue }

    await page.setContent(coverHTML(book, faces), { waitUntil: 'load' })
    await page.evaluate(() => document.fonts.ready)
    await page.screenshot({ path: file, omitBackground: true })
    made++
    console.log(`تم     ${book.slug}.png  —  ${book.title}  (${WIDTH}×${HEIGHT})`)
  }

  await browser.close()
  console.log(`\nالمجموع: ${made} غلافاً جديداً${skipped ? ` · ${skipped} موجود مسبقاً (استخدم --force لإعادة التوليد)` : ''}`)
  console.log(`المجلد: ${path.resolve(OUT_DIR)}`)
}

main().catch((e) => { console.error('\nفشل:', e.message); process.exit(1) })
