// components/layout/AnnouncementBar.tsx — شريط الإعلان · server component
// المرحلة ٠: خلفية brand-dark، نص background، ١٣ بكسل وزن ٥٠٠، سطر واحد.
export function AnnouncementBar() {
  return (
    <div className="announce-bar" role="banner">
      <div className="wrap">
        الأقسام ١–٤ من كل ملخص مفتوحة للجميع، والباقي بإيميلك فقط بلا كلمة مرور
      </div>
    </div>
  );
}
