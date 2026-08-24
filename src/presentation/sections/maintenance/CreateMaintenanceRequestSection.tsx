import React from 'react';
import { PageHeader } from '../../../app/components/PageHeader';
import {
  Wrench, Send, X, AlertTriangle, Clock, Paperclip, RefreshCw,
  Zap, Droplets, Hammer, Sparkles, FileText, Check
} from 'lucide-react';
import { useCreateMaintenanceRequest } from '../../hooks/useCreateMaintenanceRequest';

// ── Constants ─────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { id: 'electrical', label: 'أعطال كهربائية', desc: 'إنارة، مكيفات، مفاتيح كهرباء', icon: Zap, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
  { id: 'plumbing', label: 'سباكة وتمديدات', desc: 'تسريبات، دورات مياه، مضخات', icon: Droplets, color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
  { id: 'carpentry', label: 'نجارة وأثاث', desc: 'أبواب، نوافذ، أرفف ومكتبات', icon: Hammer, color: 'text-orange-500 bg-orange-500/10 border-orange-500/20' },
  { id: 'cleaning', label: 'نظافة وعناية', desc: 'غسيل سجاد، تعقيم مرافق', icon: Sparkles, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
  { id: 'other', label: 'أخرى', desc: 'صيانة عامة أو طارئة', icon: Wrench, color: 'text-slate-500 bg-slate-500/10 border-slate-500/20' },
];

const PRIORITIES = [
  { id: 'low', label: 'عادية', badge: 'منخفضة', sla: 'خلال ٧٢ ساعة', style: 'border-slate-500/20 text-slate-600 bg-slate-500/10' },
  { id: 'medium', label: 'متوسطة', badge: 'متوسطة', sla: 'خلال ٤٨ ساعة', style: 'border-primary/20 text-primary bg-primary/10' },
  { id: 'high', label: 'عالية', badge: 'عالية', sla: 'خلال ٢٤ ساعة', style: 'border-amber-500/20 text-amber-600 bg-amber-500/10' },
  { id: 'urgent', label: 'حرجة', badge: 'حرجة جداً', sla: 'استجابة فورية (أقل من ساعتين)', style: 'border-red-500/20 text-red-500 bg-red-500/10 font-black' },
];

// ── Component ─────────────────────────────────────────────────────────────────

interface CreateMaintenanceRequestSectionProps {
  onBack: () => void;
}

export function CreateMaintenanceRequestSection({ onBack }: CreateMaintenanceRequestSectionProps) {
  const {
    title, setTitle,
    category, setCategory,
    priority, setPriority,
    description, setDescription,
    notes, setNotes,
    selectedFiles,
    fileInputRef,
    handleFileChange,
    removeFile,
    formatFileSize,
    submitting,
    error,
    setError,
    handleSubmit,
    debugResponse,
    setDebugResponse,
    copiedDebug,
    copyDebugJson,
  } = useCreateMaintenanceRequest(onBack);

  const selectedCategoryObj = CATEGORIES.find(c => c.id === category) || CATEGORIES[0];
  const selectedPriorityObj = PRIORITIES.find(p => p.id === priority) || PRIORITIES[1];

  const [isAdmin, setIsAdmin] = React.useState(false);
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const userStr = localStorage.getItem('auth_user');
        if (userStr) {
          const user = JSON.parse(userStr);
          const roles: string[] = Array.isArray(user.roles) ? user.roles : (user.role ? [user.role] : []);
          if (roles.includes('super_admin') || roles.includes('admin') || user.is_super_admin) {
            setIsAdmin(true);
          }
        }
      } catch (e) {}
    }
  }, []);

  if (isAdmin) {
    return (
      <div className="flex flex-col min-h-screen bg-transparent font-['Cairo'] pb-12">
        <PageHeader title="إنشاء طلب صيانة جديد" onBack={onBack} />
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-amber-500" />
          <h3 className="text-lg font-bold text-foreground">إنشاء طلب الصيانة متاح لمدير المسجد فقط</h3>
          <p className="text-sm text-muted-foreground max-w-md">حساب الأدمن مخصص لمعالجة ومتابعة طلبات الصيانة المرفوعة وليس لتقديم طلبات صيانة جديدة.</p>
          <button onClick={onBack} className="px-5 py-2.5 bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow-md">الرجوع لقائمة الصيانة</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-transparent font-['Cairo'] pb-12">
      <PageHeader
        title="إنشاء طلب صيانة جديد"
        description="سجّل العطل بسهولة مع تحديد التصنيف والأولوية ورفع صور ومرفقات العطل."
        onBack={onBack}
        breadcrumbs={[
          { label: 'العمليات التشغيلية' },
          { label: 'مهام الصيانة' },
          { label: 'طلب صيانة جديد', active: true }
        ]}
        actions={
          <div className="flex items-center gap-3">
            <button type="button" onClick={onBack} className="px-4 py-2.5 bg-card border border-border text-muted-foreground hover:text-foreground rounded-xl text-xs font-bold transition-all hover:bg-muted">إلغاء</button>
            <button type="button" onClick={handleSubmit} disabled={submitting}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:bg-primary/90 transition-all shadow-md shadow-primary/20 disabled:opacity-50">
              {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>إرسال طلب الصيانة</span>
            </button>
          </div>
        }
      />

      <div className="px-4 md:px-8 py-4 grid grid-cols-1 xl:grid-cols-12 gap-8">

        {/* Main Form Column */}
        <div className="xl:col-span-8 space-y-6">

          {/* Success Banner */}
          {debugResponse?.isSuccess && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between shadow-sm animate-in fade-in">
              <span className="text-xs font-bold text-emerald-600">تم حفظ وإرسال طلب الصيانة بنجاح في النظام!</span>
              <button onClick={onBack} className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs shadow-md hover:bg-emerald-700 transition-colors">الرجوع لقائمة الصيانة ➔</button>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 font-bold rounded-2xl text-xs flex items-center justify-between shadow-sm animate-in fade-in">
              <div className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 shrink-0" /><span>{error}</span></div>
              <X className="w-4 h-4 cursor-pointer hover:opacity-80" onClick={() => setError(null)} />
            </div>
          )}

          {/* STEP 1: Title & Category */}
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
            <div>
              <label className="block text-sm font-black text-foreground mb-2 flex items-center gap-1.5">
                <span>عنوان الطلب</span><span className="text-red-500">*</span>
              </label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: عطل في مكيف المحراب الرئيسي أو تسريب مياه بالمغاسل..."
                className="w-full px-4 py-3.5 bg-muted/60 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl text-sm font-bold outline-none transition-all text-foreground placeholder:text-muted-foreground/70" />
            </div>

            <div>
              <label className="block text-sm font-black text-foreground mb-3 flex items-center gap-1.5">
                <span>التصنيف الفني للعطل</span><span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.id;
                  return (
                    <button key={cat.id} type="button" onClick={() => setCategory(cat.id)}
                      className={`p-4 rounded-xl border text-right transition-all flex flex-col justify-between relative group ${
                        isSelected ? 'border-primary ring-2 ring-primary/20 bg-primary/5 shadow-sm' : 'border-border bg-card hover:border-primary/40 hover:bg-muted/30'
                      }`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className={`p-2.5 rounded-lg border ${cat.color}`}><Icon className="w-5 h-5" /></div>
                        {isSelected && <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center"><Check className="w-3.5 h-3.5" /></div>}
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-foreground mb-0.5">{cat.label}</h4>
                        <p className="text-[10px] text-muted-foreground font-bold">{cat.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* STEP 2: Priority */}
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm space-y-4">
            <label className="block text-sm font-black text-foreground mb-1 flex items-center gap-1.5">
              <span>درجة الأهمية والاستجابة المطلوبة</span><span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {PRIORITIES.map((p) => {
                const isSelected = priority === p.id;
                return (
                  <button key={p.id} type="button" onClick={() => setPriority(p.id)}
                    className={`p-4 rounded-xl border text-right transition-all flex flex-col justify-between relative ${
                      isSelected ? 'border-primary ring-2 ring-primary/20 bg-primary/5 shadow-sm' : 'border-border bg-card hover:border-primary/40 hover:bg-muted/30'
                    }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${p.style}`}>{p.badge}</span>
                      {isSelected && <div className="w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center"><Check className="w-3 h-3" /></div>}
                    </div>
                    <div>
                      <span className="block text-xs font-black text-foreground">{p.label}</span>
                      <span className="block text-[10px] text-muted-foreground font-bold mt-1"><Clock className="w-3 h-3 inline ml-1" />{p.sla}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 3: Description, Notes & Files */}
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm space-y-5">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-black text-foreground flex items-center gap-1.5">
                  <span>تفاصيل ووصف العطل</span><span className="text-red-500">*</span>
                </label>
                <span className="text-[10px] text-muted-foreground font-bold">{description.length} حرف</span>
              </div>
              <textarea rows={5} value={description} onChange={(e) => setDescription(e.target.value)}
                placeholder="اكتب وصفاً واضحاً للمشكلة، المكان المحدد في المسجد، وهل يؤثر العطل على أوقات الصلاة..."
                className="w-full px-4 py-3 bg-muted/60 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl text-sm outline-none transition-all resize-none text-foreground placeholder:text-muted-foreground/70 leading-relaxed font-medium" />
            </div>

            <div>
              <label className="block text-sm font-black text-foreground mb-2">ملاحظات إضافية (اختياري)</label>
              <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)}
                placeholder="مثال: يرجى الحضور بين صلاتي الظهر والعصر..."
                className="w-full px-4 py-3 bg-muted/60 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl text-sm font-bold outline-none transition-all text-foreground placeholder:text-muted-foreground/70" />
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-black text-foreground mb-2">مرفقات وصور العطل (اختياري)</label>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} multiple
                accept="image/png, image/jpeg, image/jpg, application/pdf, .doc, .docx" className="hidden" />
              <div onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-border hover:border-primary/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:bg-muted/40 transition-colors cursor-pointer bg-card group">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2 text-primary border border-primary/20 group-hover:scale-110 transition-transform">
                  <Paperclip className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-foreground mb-0.5">انقر لرفع صور أو مستندات العطل</p>
                <p className="text-[10px] text-muted-foreground font-bold">JPG, PNG, PDF, DOC (حتى 10 ميغابايت)</p>
              </div>
              {selectedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  <span className="text-[11px] font-bold text-muted-foreground">الملفات المحددة ({selectedFiles.length}):</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-muted border border-border rounded-xl text-xs font-bold text-foreground">
                        <Paperclip className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="max-w-[160px] truncate">{file.name}</span>
                        <span className="text-[10px] text-muted-foreground">({formatFileSize(file.size)})</span>
                        <X className="w-3.5 h-3.5 cursor-pointer text-muted-foreground hover:text-red-500 transition-colors"
                          onClick={(e) => { e.stopPropagation(); removeFile(idx); }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-border flex items-center justify-between">
              <button type="button" onClick={onBack} className="px-6 py-3 bg-muted text-foreground rounded-xl text-xs font-bold hover:bg-muted/80 transition-all border border-border">إلغاء</button>
              <button type="button" onClick={handleSubmit} disabled={submitting}
                className="flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50">
                {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>إرسال طلب الصيانة</span>
              </button>
            </div>
          </div>
        </div>

        {/* Side Column: Live Summary */}
        <div className="xl:col-span-4 space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm sticky top-24 space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="text-base font-black text-foreground flex items-center gap-2"><FileText className="w-4 h-4 text-primary" /> ملخص الطلب</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">معاينة مباشرة</span>
            </div>
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">العنوان</span>
                <p className="text-sm font-bold text-foreground line-clamp-2">{title.trim() || 'لم يتم كتابة عنوان بعد...'}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/60">
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">التصنيف</span>
                  <span className="text-xs font-bold text-foreground inline-flex items-center gap-1">
                    <selectedCategoryObj.icon className="w-3.5 h-3.5 text-primary" />{selectedCategoryObj.label}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">الأولوية</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${selectedPriorityObj.style}`}>{selectedPriorityObj.badge}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-border/60">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">المرفقات</span>
                <span className="text-xs font-bold text-foreground flex items-center gap-1">
                  <Paperclip className="w-3.5 h-3.5 text-primary" />
                  {selectedFiles.length > 0 ? `${selectedFiles.length} ملفات محددة` : 'لا توجد مرفقات'}
                </span>
              </div>
            </div>
            <div className="pt-4 border-t border-border space-y-3">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">مسار طلب الصيانة</span>
              <div className="space-y-2.5">
                {['تقديم الطلب', 'المراجعة والتكليف', 'متابعة وإنجاز العمل'].map((step, i) => (
                  <div key={i} className={`flex items-center gap-3 text-xs font-bold ${i === 0 ? 'text-foreground' : 'text-muted-foreground'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${i === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted border border-border'}`}>{i + 1}</div>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
