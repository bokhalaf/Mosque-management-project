import React from 'react';
import { PageHeader } from "../PageHeader";
import { Search, Plus, ArrowRight, Heart } from "lucide-react";

export function ComponentsSection() {
  return (
    <div className="flex flex-col min-h-screen bg-transparent font-['Cairo'] pb-12">
      <PageHeader 
        title="مكونات النظام (Components)"
        description="استعرض المكونات القابلة لإعادة الاستخدام والمبنية على أسس التصميم التي تتوافق مع الوضعين الفاتح والداكن."
        breadcrumbs={[
          { label: "نظام التصميم" },
          { label: "المكونات", active: true }
        ]}
      />

      <div className="px-4 md:px-8 space-y-12">
        {/* Buttons Section */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-black text-foreground border-b border-border pb-2 inline-block">الأزرار (Buttons)</h2>
            <p className="text-sm text-muted-foreground mt-2">
              حالات الأزرار المختلفة، تتغير ألوانها ديناميكياً مع الثيم.
            </p>
          </div>

          <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Primary Buttons */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-muted-foreground mb-4">الأساسي (Primary)</h3>
                <button className="w-full px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                  زر أساسي
                </button>
                <button className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                  <Plus className="w-4 h-4" />
                  أساسي مع أيقونة
                </button>
              </div>

              {/* Secondary Buttons */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-muted-foreground mb-4">الثانوي (Secondary)</h3>
                <button className="w-full px-5 py-2.5 bg-muted text-foreground rounded-xl text-sm font-bold hover:bg-muted/80 transition-all">
                  زر ثانوي
                </button>
                <button className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-muted text-foreground rounded-xl text-sm font-bold hover:bg-muted/80 transition-all">
                  ثانوي مع أيقونة
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Outline Buttons */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-muted-foreground mb-4">مفرغ (Outline)</h3>
                <button className="w-full px-5 py-2.5 bg-transparent border-2 border-primary text-primary rounded-xl text-sm font-bold hover:bg-primary/5 transition-all">
                  زر مفرغ
                </button>
                <button className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-card border border-border text-foreground rounded-xl text-sm font-bold hover:bg-muted transition-all">
                  زر بحدود خفيفة
                </button>
              </div>

              {/* Ghost/Destructive Buttons */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-muted-foreground mb-4">أخرى (Ghost & Destructive)</h3>
                <button className="w-full px-5 py-2.5 bg-transparent text-primary hover:bg-primary/10 rounded-xl text-sm font-bold transition-all">
                  زر شفاف (Ghost)
                </button>
                <button className="w-full px-5 py-2.5 bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-xl text-sm font-bold transition-all border border-destructive/20">
                  زر تحذيري
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Inputs Section */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-black text-foreground border-b border-border pb-2 inline-block">حقول الإدخال (Inputs & Forms)</h2>
            <p className="text-sm text-muted-foreground mt-2">
              تتفاعل حقول الإدخال مع التركيز (Focus) وتستخدم متغيرات الألوان الديناميكية.
            </p>
          </div>

          <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Default Input */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground px-1">حقل نصي عادي</label>
                <input 
                  type="text" 
                  placeholder="أدخل النص هنا..." 
                  className="w-full h-12 px-4 bg-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
              </div>

              {/* Input with Icon */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground px-1">حقل بحث</label>
                <div className="relative">
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input 
                    type="text" 
                    placeholder="بحث..." 
                    className="w-full h-12 pr-11 pl-4 bg-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                </div>
              </div>

              {/* Select */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground px-1">قائمة منسدلة (Select)</label>
                <select className="w-full h-12 px-4 bg-background border border-border rounded-xl text-sm text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none">
                  <option>الخيار الأول</option>
                  <option>الخيار الثاني</option>
                  <option>الخيار الثالث</option>
                </select>
              </div>

              {/* Textarea */}
              <div className="space-y-2 md:col-span-2 lg:col-span-3">
                <label className="text-sm font-bold text-foreground px-1">مربع نص (Textarea)</label>
                <textarea 
                  rows={4}
                  placeholder="اكتب ملاحظاتك هنا..." 
                  className="w-full p-4 bg-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Cards & Badges Section */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-black text-foreground border-b border-border pb-2 inline-block">البطاقات والشارات (Cards & Badges)</h2>
            <p className="text-sm text-muted-foreground mt-2">
              حاويات لعرض المعلومات وحالات العناصر.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Simple Card */}
            <div className="bg-card border border-border rounded-[1.5rem] p-6 shadow-sm flex flex-col justify-between">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Heart className="w-6 h-6 text-primary" />
                </div>
                <span className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-lg text-xs font-bold">
                  نشط
                </span>
              </div>
              <div>
                <p className="text-sm font-bold text-muted-foreground">بطاقة معلومات قياسية</p>
                <p className="text-2xl font-black text-foreground mt-1">1,240 ر.س</p>
              </div>
            </div>

            {/* Badges Container */}
            <div className="bg-card border border-border rounded-[1.5rem] p-8 shadow-sm">
              <h3 className="text-sm font-bold text-foreground mb-6">شارات الحالة (Status Badges)</h3>
              <div className="flex flex-wrap gap-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                  مكتمل / أساسي
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  قيد المعالجة
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  متأخر / تحذير
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-destructive/10 text-destructive border border-destructive/20">
                  <span className="w-2 h-2 rounded-full bg-destructive"></span>
                  مرفوض / خطأ
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-muted text-muted-foreground border border-border">
                  <span className="w-2 h-2 rounded-full bg-muted-foreground"></span>
                  محايد / مسودة
                </span>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
