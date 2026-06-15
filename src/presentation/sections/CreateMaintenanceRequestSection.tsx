import React, { useState } from 'react';
import { PageHeader } from "../../app/components/PageHeader";
import { 
  Wrench, Save, X, Activity, CheckCircle2, AlertTriangle, 
  MapPin, Clock, Paperclip, Plus, Send, Settings, User, DollarSign,
  Briefcase, ArrowRight, UploadCloud, Link as LinkIcon, Info
} from 'lucide-react';

interface CreateMaintenanceRequestSectionProps {
  onBack: () => void;
}

export function CreateMaintenanceRequestSection({ onBack }: CreateMaintenanceRequestSectionProps) {
  const [priority, setPriority] = useState('medium');
  const [category, setCategory] = useState('');
  
  return (
    <div className="flex flex-col min-h-screen bg-transparent font-['Cairo'] pb-24">
      <PageHeader 
        title="إنشاء طلب صيانة"
        description="تسجيل عطل جديد وتحديد مسار المعالجة مع الحفاظ على كفاءة العمليات التشغيلية."
        onBack={onBack}
        breadcrumbs={[
          { label: "العمليات التشغيلية" },
          { label: "مهام الصيانة" },
          { label: "طلب صيانة جديد", active: true }
        ]}
        actions={
          <div className="flex gap-2">
            <button 
              onClick={onBack}
              className="px-4 py-2 bg-transparent text-muted-foreground rounded-lg text-sm font-bold hover:bg-muted transition-all"
            >
              إلغاء
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border text-foreground rounded-lg text-sm font-bold hover:bg-muted transition-all shadow-sm">
              <Save className="w-4 h-4" /> حفظ كمسودة
            </button>
          </div>
        }
      />

      <div className="px-4 md:px-8 py-4 grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Main Form Column */}
        <div className="xl:col-span-8 space-y-8">
          
          {/* SECTION: Basic Information */}
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm">
            <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
              <Info className="w-5 h-5 text-primary" /> المعلومات الأساسية
            </h3>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">عنوان الطلب <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  placeholder="مثال: تعطل وحدة التكييف المركزية..." 
                  className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm text-foreground placeholder:text-muted-foreground"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">التصنيف الفني <span className="text-red-500">*</span></label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm text-foreground"
                  >
                    <option value="" disabled>اختر التصنيف...</option>
                    <option value="electrical">أعطال كهربائية</option>
                    <option value="plumbing">سباكة وتمديدات مياه</option>
                    <option value="hvac">تكييف وتبريد (HVAC)</option>
                    <option value="audio">الأنظمة الصوتية والمرئية</option>
                    <option value="structural">صيانة إنشائية</option>
                    <option value="furniture">أثاث وفرش</option>
                    <option value="cleaning">نظافة وعناية بالمرافق</option>
                    <option value="other">أخرى</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">درجة الأهمية <span className="text-red-500">*</span></label>
                  <div className="grid grid-cols-4 gap-2">
                    {['low', 'medium', 'high', 'critical'].map(p => (
                      <button
                        key={p}
                        onClick={() => setPriority(p)}
                        className={`py-2 rounded-lg text-xs font-bold transition-all border ${
                          priority === p 
                            ? p === 'critical' ? 'bg-red-500/10 border-red-500/20 text-red-500' 
                            : p === 'high' ? 'bg-amber-500/10 border-amber-500/20 text-amber-600'
                            : p === 'medium' ? 'bg-primary/10 border-primary/20 text-primary'
                            : 'bg-slate-500/10 border-slate-500/20 text-slate-600'
                            : 'bg-muted border-border text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        {p === 'critical' ? 'حرجة' : p === 'high' ? 'عالية' : p === 'medium' ? 'متوسطة' : 'عادية'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION: Location */}
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm">
            <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" /> تفاصيل الموقع
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">المنطقة <span className="text-red-500">*</span></label>
                <select className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm text-foreground">
                  <option>المصلى الرئيسي (رجال)</option>
                  <option>مصلى النساء</option>
                  <option>الساحات الخارجية</option>
                  <option>دورات المياه</option>
                  <option>سكن الإمام/المؤذن</option>
                  <option>المرافق الإدارية</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">القسم المحدد</label>
                <input 
                  type="text" 
                  placeholder="مثال: الدور الثاني، البوابة الشرقية..." 
                  className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-foreground mb-2">مرافق متأثرة (اختياري)</label>
              <input 
                type="text" 
                placeholder="مثال: يمنع استخدام الركن الجنوبي الغربي بالكامل." 
                className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* SECTION: Issue Details & Attachments */}
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm">
            <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" /> تفاصيل المشكلة والمرفقات
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">وصف العطل <span className="text-red-500">*</span></label>
                <textarea 
                  rows={4}
                  placeholder="الرجاء تقديم وصف دقيق وشامل للمشكلة لمساعدة الفني في تحديد المعدات المطلوبة..." 
                  className="w-full px-4 py-3 bg-muted border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm resize-none text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-foreground mb-2">المرفقات الإضافية (صور، مقاطع مرئية، مستندات)</label>
                <div className="w-full border-2 border-dashed border-border rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-pointer bg-card">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <UploadCloud className="w-6 h-6 text-primary" />
                  </div>
                  <p className="text-sm font-bold text-foreground mb-1">انقر للرفع أو قم بسحب الملفات هنا</p>
                  <p className="text-xs text-muted-foreground">الحد الأقصى للملفات: ١٠ ميغابايت (JPG, PNG, PDF, MP4)</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Side Summary Column */}
        <div className="xl:col-span-4 space-y-6">
          
          {/* SECTION: Live Request Summary Card */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm sticky top-24">
            <h3 className="text-lg font-bold text-foreground mb-4">ملخص الطلب</h3>
            
            <div className="space-y-4">
              <div className="pb-4 border-b border-border">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">حالة الاعتماد الأولية</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-sm font-bold text-foreground">جاهز للإرسال</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center py-2">
                <span className="text-xs text-muted-foreground font-medium">مستوى الأولوية</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                    priority === 'critical' ? 'bg-red-500/10 border-red-500/20 text-red-500' 
                  : priority === 'high' ? 'bg-amber-500/10 border-amber-500/20 text-amber-600'
                  : priority === 'medium' ? 'bg-primary/10 border-primary/20 text-primary'
                  : 'bg-slate-500/10 border-slate-500/20 text-slate-600'
                }`}>
                  {priority === 'critical' ? 'حرجة' : priority === 'high' ? 'عالية' : priority === 'medium' ? 'متوسطة' : 'عادية'}
                </span>
              </div>
              
              <div className="flex justify-between items-center py-2">
                <span className="text-xs text-muted-foreground font-medium">التصنيف</span>
                <span className="text-sm font-bold text-foreground">{category || 'غير محدد'}</span>
              </div>
            </div>

            {/* SECTION: Maintenance Timeline Preview */}
            <div className="mt-8 pt-6 border-t border-border">
              <h4 className="text-sm font-bold text-foreground mb-4">مسار العملية المتوقع</h4>
              <div className="space-y-4 relative">
                <div className="absolute right-3.5 top-2 bottom-2 w-px bg-border"></div>
                
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center border-2 border-card text-white">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-foreground">إنشاء الطلب</span>
                </div>
                
                <div className="flex items-center gap-4 relative z-10 opacity-50">
                  <div className="w-7 h-7 rounded-full bg-muted border border-border flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/30"></div>
                  </div>
                  <span className="text-xs font-bold text-foreground">الاعتماد والمراجعة</span>
                </div>

                <div className="flex items-center gap-4 relative z-10 opacity-50">
                  <div className="w-7 h-7 rounded-full bg-muted border border-border flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/30"></div>
                  </div>
                  <span className="text-xs font-bold text-foreground">تنفيذ الصيانة</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION: Quick Actions Footer */}
      <div className="fixed bottom-0 left-0 right-0 lg:right-[280px] bg-card border-t border-border p-4 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] z-40 transition-all">
        <div className="flex justify-between items-center max-w-7xl mx-auto px-4 md:px-8">
          <button 
            onClick={onBack}
            className="px-6 py-2.5 bg-muted text-foreground rounded-xl text-sm font-bold hover:bg-muted/80 transition-all border border-border"
          >
            مسح البيانات
          </button>
          
          <div className="flex gap-3">
            <button className="px-6 py-2.5 bg-card border border-border text-foreground rounded-xl text-sm font-bold hover:bg-muted transition-all">
              حفظ كمسودة
            </button>
            <button 
              onClick={onBack}
              className="flex items-center gap-2 px-8 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
            >
              <Send className="w-4 h-4" />
              إرسال الطلب واعتماده
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
