'use client';
import React from 'react';
import { PageHeader } from '../../../app/components/PageHeader';
import {
  BookOpen, Plus, Mic, Square, Play, Pause, Send, FileText, CheckCircle2,
  AlertTriangle, RefreshCw, X, ScanText
} from 'lucide-react';
import { useCreateKhutbah } from '../../hooks/useCreateKhutbah';

// ── Constants ─────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { id: 'creed_faith', label: 'عقيدة وإيمانيات' },
  { id: 'jurisprudence_rulings', label: 'فقه وأحكام' },
  { id: 'ethics_conduct', label: 'أخلاق وسلوك' },
  { id: 'contemporary_issues', label: 'قضايا معاصرة' },
  { id: 'occasions_seasons', label: 'مناسبات ومواسم' },
  { id: 'other', label: 'غير ذلك' },
];

// ── Component ─────────────────────────────────────────────────────────────────

interface CreateKhutbahSectionProps {
  onBack: () => void;
}

export function CreateKhutbahSection({ onBack }: CreateKhutbahSectionProps) {
  const {
    title, setTitle,
    preacher, setPreacher,
    category, setCategory,
    content, setContent,
    publishForFriday, setPublishForFriday,
    isDictating, isPaused,
    startDictation, pauseDictation, resumeDictation, stopDictation,
    isScanningImage, ocrProgress, ocrStatusText, imageInputRef, handleImageOCR,
    submitting, error, setError,
    handleSubmit,
  } = useCreateKhutbah(onBack);

  return (
    <div className="flex flex-col min-h-screen bg-transparent font-['Cairo'] pb-12">
      <PageHeader
        title="إضافة خطبة مسجد جديدة"
        description="تسجيل محاور ونص الخطبة الجديدة وإعدادها كخطبة معتمدة ليوم الجمعة."
        onBack={onBack}
        breadcrumbs={[
          { label: 'إدارة المسجد' },
          { label: 'خطب المسجد' },
          { label: 'إضافة خطبة', active: true }
        ]}
        actions={
          <div className="flex items-center gap-3">
            <button type="button" onClick={onBack} className="px-4 py-2.5 bg-card border border-border text-muted-foreground hover:text-foreground rounded-xl text-xs font-bold transition-all hover:bg-muted">إلغاء</button>
            <button type="button" onClick={handleSubmit} disabled={submitting}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:bg-primary/90 transition-all shadow-md shadow-primary/20 disabled:opacity-50">
              {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>حفظ ونشر الخطبة</span>
            </button>
          </div>
        }
      />

      <div className="px-4 md:px-8 py-4 grid grid-cols-1 xl:grid-cols-12 gap-8">

        {/* Main Form */}
        <div className="xl:col-span-8 space-y-6">

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 font-bold rounded-2xl text-xs flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 shrink-0" /><span>{error}</span></div>
              <X className="w-4 h-4 cursor-pointer" onClick={() => setError(null)} />
            </div>
          )}

          {/* STEP 1: Basic Info */}
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm space-y-5">
            <h3 className="text-base font-black text-foreground flex items-center gap-2 border-b border-border pb-4">
              <BookOpen className="w-4 h-4 text-primary" /> البيانات الأساسية للخطبة
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">عنوان الخطبة <span className="text-red-500">*</span></label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: فضل الأخلاق الكريمة..."
                  className="w-full px-4 py-3 bg-muted/60 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl text-xs font-bold outline-none text-foreground" />
              </div>
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">اسم الخطيب / الشيخ <span className="text-red-500">*</span></label>
                <input type="text" value={preacher} onChange={(e) => setPreacher(e.target.value)}
                  placeholder="مثال: الشيخ د. عبد الرحمن السديس..."
                  className="w-full px-4 py-3 bg-muted/60 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl text-xs font-bold outline-none text-foreground" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-2">تصنيف الخطبة</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button key={cat.id} type="button" onClick={() => setCategory(cat.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                      category === cat.id ? 'bg-primary text-primary-foreground border-primary shadow-sm' : 'bg-muted/60 border-border text-muted-foreground hover:bg-muted'
                    }`}>
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* STEP 2: Content */}
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="text-base font-black text-foreground flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" /> نص ومحاور الخطبة الرئيسية
              </h3>
              {/* Action Toolbar */}
              <div className="flex items-center gap-2">
                {/* OCR */}
                <input type="file" ref={imageInputRef} onChange={handleImageOCR} accept="image/*" className="hidden" />
                <button type="button" onClick={() => imageInputRef.current?.click()} disabled={isScanningImage}
                  className="w-10 h-10 rounded-xl bg-muted border border-border hover:border-primary/50 text-foreground flex items-center justify-center transition-all" title="مسح الصور OCR">
                  {isScanningImage ? <RefreshCw className="w-4 h-4 animate-spin text-primary" /> : <ScanText className="w-4 h-4 text-primary" />}
                </button>

                <div className="w-px h-6 bg-border mx-0.5" />

                {/* Mic */}
                {!isDictating && !isPaused ? (
                  <button type="button" onClick={startDictation}
                    className="w-10 h-10 rounded-xl bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white flex items-center justify-center transition-all" title="بدء الإملاء الصوتي">
                    <Mic className="w-5 h-5" />
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5 p-1 bg-red-500/10 border border-red-500/20 rounded-xl animate-in fade-in">
                    {isPaused ? (
                      <button type="button" onClick={resumeDictation} className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center" title="استكمال"><Play className="w-4 h-4 fill-current" /></button>
                    ) : (
                      <button type="button" onClick={pauseDictation} className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center" title="إيقاف مؤقت"><Pause className="w-4 h-4" /></button>
                    )}
                    <button type="button" onClick={stopDictation} className="w-8 h-8 rounded-lg bg-red-500 text-white flex items-center justify-center" title="إنهاء"><Square className="w-3.5 h-3.5 fill-current" /></button>
                  </div>
                )}
              </div>
            </div>

            {/* Status bars */}

            {isScanningImage && (
              <div className="p-3.5 bg-primary/10 border border-primary/20 rounded-xl text-primary text-xs font-bold space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><RefreshCw className="w-4 h-4 animate-spin shrink-0" /><span>{ocrStatusText}</span></div>
                  <span>{ocrProgress}%</span>
                </div>
                <div className="w-full h-1.5 bg-primary/20 rounded-full overflow-hidden">
                  <div className="h-full bg-primary transition-all duration-300" style={{ width: `${ocrProgress}%` }} />
                </div>
              </div>
            )}

            {(isDictating || isPaused) && (
              <div className="p-2.5 bg-muted/60 border border-border rounded-xl flex items-center gap-2 text-xs font-bold animate-in fade-in">
                <span className={`w-2.5 h-2.5 rounded-full ${isPaused ? 'bg-amber-500' : 'bg-red-500 animate-ping'}`} />
                <span className={isPaused ? 'text-amber-600' : 'text-red-500'}>{isPaused ? 'الإملاء متوقف مؤقتاً...' : 'جاري الاستماع للمايك...'}</span>
              </div>
            )}

            <textarea rows={8} value={content} onChange={(e) => setContent(e.target.value)}
              placeholder="اكتب نص الخطبة أو عناصرها، أو انقر أيقونة السماعة للقراءة الصوتية، أو انقر أيقونة الماسح لرفع صورة..."
              className="w-full px-4 py-3 bg-muted/60 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl text-xs outline-none transition-all resize-none text-foreground font-medium leading-relaxed" />

            <label className="flex items-center gap-3 pt-2 cursor-pointer select-none">
              <input type="checkbox" checked={publishForFriday} onChange={(e) => setPublishForFriday(e.target.checked)}
                className="w-4 h-4 text-primary rounded border-border focus:ring-primary cursor-pointer" />
              <span className="text-xs font-bold text-foreground">اعتماد هذه الخطبة فورياً كخطبة الجمعة القادمة للمسجد</span>
            </label>
          </div>
        </div>

        {/* Side Summary */}
        <div className="xl:col-span-4 space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm sticky top-24 space-y-4">
            <h3 className="text-base font-black text-foreground border-b border-border pb-3">ملخص اعتماد الخطبة</h3>
            <div className="space-y-3">
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase">عنوان الخطبة</span>
                <p className="text-xs font-bold text-foreground">{title.trim() || 'لم يحدد بعد'}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase">الخطيب</span>
                <p className="text-xs font-bold text-foreground">{preacher.trim() || 'لم يحدد بعد'}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase">التصنيف</span>
                <p className="text-xs font-bold text-primary">{CATEGORIES.find(c => c.id === category)?.label || category}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase">النص المكتوب</span>
                <p className="text-xs font-bold text-foreground">{content.trim() ? `${content.length} حرف` : 'لم يكتب بعد'}</p>
              </div>
            </div>
            <button type="button" onClick={handleSubmit} disabled={submitting}
              className="w-full py-3 bg-primary text-primary-foreground rounded-xl text-xs font-bold shadow-md hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
              <span>{submitting ? 'جاري إرسال الطلب...' : 'حفظ ونشر الخطبة'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
