import React from 'react';
import { PageHeader } from "../PageHeader";

export function FoundationSection() {
  const dynamicColors = [
    { nameAr: "الخلفية", name: "Background", classKey: "bg-background", textKey: "text-foreground" },
    { nameAr: "السطح / البطاقة", name: "Card", classKey: "bg-card", textKey: "text-foreground" },
    { nameAr: "الأساسي", name: "Primary", classKey: "bg-primary", textKey: "text-primary-foreground" },
    { nameAr: "المخفف", name: "Muted", classKey: "bg-muted", textKey: "text-foreground" },
    { nameAr: "النص المخفف", name: "Muted Foreground", classKey: "bg-muted text-muted-foreground", textKey: "text-muted-foreground" },
    { nameAr: "النص الرئيسي", name: "Foreground", classKey: "bg-foreground", textKey: "text-background" },
    { nameAr: "الحدود", name: "Border", classKey: "bg-border", textKey: "text-foreground" },
    { nameAr: "التدميري", name: "Destructive", classKey: "bg-destructive", textKey: "text-destructive-foreground" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-transparent font-['Cairo'] pb-12">
      <PageHeader 
        title="أسس التصميم (Foundations)"
        description="هنا يمكنك معاينة الألوان، الخطوط، والمسافات وكيفية تفاعلها مع الوضع الداكن بشكل ديناميكي."
        breadcrumbs={[
          { label: "نظام التصميم" },
          { label: "الأسس", active: true }
        ]}
      />

      <div className="px-4 md:px-8 space-y-12">
        {/* Colors Section */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-black text-foreground border-b border-border pb-2 inline-block">الألوان الديناميكية (Dynamic Colors)</h2>
            <p className="text-sm text-muted-foreground mt-2">
              جميع الألوان أدناه تستخدم متغيرات التصميم (CSS Variables) وتتغير تلقائياً مع الوضع الفاتح والداكن لضمان اتساق الواجهة.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {dynamicColors.map((color) => (
              <div key={color.classKey} className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                <div className={`h-24 w-full flex items-center justify-center ${color.classKey} border-b border-border`}>
                  <span className={`font-bold text-sm ${color.textKey}`}>{color.classKey.split(' ')[0]}</span>
                </div>
                <div className="p-4 bg-card">
                  <p className="text-sm font-black text-foreground">{color.nameAr}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{color.name}</p>
                  <div className="mt-3 bg-muted/50 rounded-lg p-2 flex items-center justify-center">
                    <code className="text-[10px] font-mono text-primary">{color.classKey.split(' ')[0]}</code>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Typography Section */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-black text-foreground border-b border-border pb-2 inline-block">الخطوط (Typography)</h2>
            <p className="text-sm text-muted-foreground mt-2">
              يتم استخدام خط (Cairo) كخط أساسي للنظام مع أوزان وأحجام متدرجة.
            </p>
          </div>

          <div className="bg-card border border-border rounded-3xl p-8 shadow-sm space-y-8">
            <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-12 border-b border-border pb-6">
              <div className="w-32 shrink-0">
                <code className="text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded">text-4xl</code>
              </div>
              <div className="text-4xl font-black text-foreground">العنوان الرئيسي الأول (H1)</div>
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-12 border-b border-border pb-6">
              <div className="w-32 shrink-0">
                <code className="text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded">text-3xl</code>
              </div>
              <div className="text-3xl font-black text-foreground">العنوان الرئيسي الثاني (H2)</div>
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-12 border-b border-border pb-6">
              <div className="w-32 shrink-0">
                <code className="text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded">text-2xl</code>
              </div>
              <div className="text-2xl font-bold text-foreground">العنوان الفرعي الثالث (H3)</div>
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-12 border-b border-border pb-6">
              <div className="w-32 shrink-0">
                <code className="text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded">text-base</code>
              </div>
              <div className="text-base font-normal text-muted-foreground leading-relaxed max-w-2xl">
                هذا النص يمثل الخط الأساسي للفقرات والمحتوى العام (Body). يمتاز بوضوح القراءة ومسافات أسطر مريحة للعين، وتتغير ألوانه ديناميكياً مع الثيم لتقليل إجهاد العين.
              </div>
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-12 pb-2">
              <div className="w-32 shrink-0">
                <code className="text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded">text-xs</code>
              </div>
              <div className="text-xs font-medium text-muted-foreground">
                يستخدم للنصوص التوضيحية (Small)، التواريخ، والملاحظات الصغيرة.
              </div>
            </div>
          </div>
        </section>

        {/* Spacing & Radius Section */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-black text-foreground border-b border-border pb-2 inline-block">المسافات والزوايا (Spacing & Radius)</h2>
            <p className="text-sm text-muted-foreground mt-2">
              تم توحيد المسافات وزوايا الانحناء لضمان مظهر متناسق في كامل النظام.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
              <h3 className="text-lg font-bold text-foreground mb-6">زوايا الانحناء (Border Radius)</h3>
              <div className="flex flex-wrap gap-6 items-end">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 bg-muted rounded-sm border border-border flex items-center justify-center"><code className="text-[10px] text-muted-foreground">rounded-sm</code></div>
                </div>
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 bg-muted rounded-md border border-border flex items-center justify-center"><code className="text-[10px] text-muted-foreground">rounded-md</code></div>
                </div>
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 bg-muted rounded-lg border border-border flex items-center justify-center"><code className="text-[10px] text-muted-foreground">rounded-lg</code></div>
                </div>
                <div className="flex flex-col items-center gap-3">
                  <div className="w-20 h-20 bg-primary/20 rounded-xl border-2 border-primary flex items-center justify-center"><code className="text-xs font-bold text-primary">rounded-xl</code></div>
                </div>
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 bg-muted rounded-2xl border border-border flex items-center justify-center"><code className="text-[10px] text-muted-foreground">rounded-2xl</code></div>
                </div>
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 bg-muted rounded-full border border-border flex items-center justify-center"><code className="text-[10px] text-muted-foreground">rounded-full</code></div>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
              <h3 className="text-lg font-bold text-foreground mb-6">الظلال الديناميكية (Shadows)</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                <div className="h-24 bg-card border border-border rounded-xl shadow-sm flex flex-col items-center justify-center gap-2">
                  <span className="text-sm font-bold text-foreground">sm</span>
                  <code className="text-[10px] text-muted-foreground">shadow-sm</code>
                </div>
                <div className="h-24 bg-card border border-border rounded-xl shadow flex flex-col items-center justify-center gap-2">
                  <span className="text-sm font-bold text-foreground">default</span>
                  <code className="text-[10px] text-muted-foreground">shadow</code>
                </div>
                <div className="h-24 bg-card border border-border rounded-xl shadow-md flex flex-col items-center justify-center gap-2">
                  <span className="text-sm font-bold text-foreground">md</span>
                  <code className="text-[10px] text-muted-foreground">shadow-md</code>
                </div>
                <div className="h-24 bg-card border border-border rounded-xl shadow-lg flex flex-col items-center justify-center gap-2">
                  <span className="text-sm font-bold text-foreground">lg</span>
                  <code className="text-[10px] text-muted-foreground">shadow-lg</code>
                </div>
                <div className="h-24 bg-primary rounded-xl shadow-lg shadow-primary/30 flex flex-col items-center justify-center gap-2 sm:col-span-2">
                  <span className="text-sm font-bold text-primary-foreground">Primary Shadow</span>
                  <code className="text-[10px] text-primary-foreground/70 text-center">shadow-lg shadow-primary/30</code>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
