export function Section({
  num,
  title,
  children,
  className = "",
}: {
  num: number;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`mt-10 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <span className="bh-sec-num text-bh-primary bg-bh-primary-light px-2.5 py-1 rounded-full shrink-0">
          القسم {num}
        </span>
        <h2 className="bh-sec-title text-bh-primary-dark">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export function LabelCard({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bh-card p-5">
      {/* العنوان 15px bold — أكبر من النص 14px. قاعدة ملزمة. */}
      <p className="bh-card-label mb-2">{label}</p>
      <p className="bh-body">{children}</p>
    </div>
  );
}
