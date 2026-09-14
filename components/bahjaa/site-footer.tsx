// components/bahjaa/site-footer.tsx
import Image from 'next/image'

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div>
          <Image className="logo-mark" src="/logo/logo-paper.png" width={40} height={40} alt="شعار بهجة" loading="lazy" />
          <p className="meta" style={{ marginTop: 10 }}>نحوّل المعرفة إلى أثر</p>
        </div>
        <p className="meta">© ٢٠٢٦ · bahjaa.com</p>
      </div>
    </footer>
  )
}
