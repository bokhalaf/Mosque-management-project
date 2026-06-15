import { 
  Search, Bell, ArrowRight, Upload, 
  Wallet, Calendar, Users, 
  ChevronLeft, Info, HelpCircle
} from "lucide-react";

interface AddDonationSectionProps {
  onBack: () => void;
}

import { PageHeader } from "../../app/components/PageHeader";

export function AddDonationSection({ onBack }: AddDonationSectionProps) {
  return (
    <div className="flex flex-col min-h-screen bg-transparent">
      <PageHeader 
        title="إضافة تبرع جديد"
        description="قم بإدخال تفاصيل التبرع الجديد لتسجيله في النظام بدقة."
        onBack={onBack}
        breadcrumbs={[
          { label: "إدارة التبرعات" },
          { label: "إضافة تبرع", active: true }
        ]}
      />

      <main className="px-4 md:px-8 pt-0">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card border border-border rounded-[2rem] p-6 md:p-8 shadow-sm">
              <form className="space-y-6">
                {/* Upload Section */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-foreground">صورة الإيصال (اختياري)</label>
                  <div className="border-2 border-dashed border-border rounded-2xl p-8 flex flex-col items-center justify-center gap-3 hover:border-primary/50 hover:bg-primary/[0.02] transition-all cursor-pointer group">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Upload className="w-6 h-6 text-primary" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold">اضغط لرفع الملف أو اسحبه هنا</p>
                      <p className="text-xs text-muted-foreground mt-1">PNG, JPG, PDF حتى 10MB</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold px-1">اسم المتبرع</label>
                    <input 
                      type="text" 
                      placeholder="أدخل اسم المتبرع كاملاً" 
                      className="w-full h-12 px-4 bg-muted/30 border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold px-1">مبلغ التبرع</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        placeholder="0.00" 
                        className="w-full h-12 pr-4 pl-12 bg-muted/30 border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                      />
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">ر.س</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold px-1">نوع التبرع</label>
                    <select className="w-full h-12 px-4 bg-muted/30 border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none appearance-none">
                      <option value="">اختر النوع...</option>
                      <option value="general">تبرع عام</option>
                      <option value="zakat">زكاة</option>
                      <option value="sadaqah">صدقة جارية</option>
                      <option value="maintenance">صيانة المسجد</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold px-1">الحملة المرتبطة (اختياري)</label>
                    <select className="w-full h-12 px-4 bg-muted/30 border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none appearance-none">
                      <option value="">لا يوجد حملة محددة</option>
                      <option value="1">حفر بئر ارتوازي</option>
                      <option value="2">إفطار صائم</option>
                      <option value="3">كفالة يتيم</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold px-1">ملاحظات إضافية</label>
                  <textarea 
                    placeholder="أدخل أي ملاحظات إضافية هنا..." 
                    className="w-full h-32 p-4 bg-muted/30 border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none resize-none"
                  ></textarea>
                </div>

                <div className="pt-4 flex gap-4">
                  <button className="flex-1 h-12 bg-primary text-white font-bold rounded-xl hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 transition-all">
                    تسجيل التبرع
                  </button>
                  <button 
                    type="button"
                    onClick={onBack}
                    className="flex-1 h-12 bg-muted text-foreground font-bold rounded-xl hover:bg-muted/80 transition-all"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar Stats & Info */}
          <div className="space-y-6">
            {/* Daily Summary Card */}
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-primary">ملخص اليوم</p>
                  <p className="text-sm font-medium text-primary/80">إحصائيات فورية</p>
                </div>
              </div>
              
              <div className="space-y-4 pt-2">
                <div className="flex justify-between items-end border-b border-primary/10 pb-4">
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">إجمالي تبرعات اليوم</p>
                    <p className="text-2xl font-black text-foreground tracking-tight">12,450 <span className="text-xs font-bold text-muted-foreground">ر.س</span></p>
                  </div>
                  <div className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">+5%</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground">عدد العمليات</p>
                    <p className="text-lg font-bold">24</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground">متوسط التبرع</p>
                    <p className="text-lg font-bold">518 ر.س</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h4 className="font-bold text-sm flex items-center gap-2 mb-4">
                <Info className="w-4 h-4 text-blue-500" />
                إرشادات هامة
              </h4>
              <ul className="space-y-3">
                {[
                  "تأكد من مطابقة المبلغ للمكتوب في الإيصال",
                  "اختر نوع التبرع بدقة لضمان صحة التقارير",
                  "يفضل رفع نسخة من الإيصال للشفافية المالية",
                  "سيصل تنبيه للمتبرع فور تأكيد العملية"
                ].map((text, i) => (
                  <li key={i} className="flex gap-3 text-xs text-muted-foreground leading-relaxed">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5"></div>
                    {text}
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card border border-border rounded-2xl p-4 flex flex-col items-center text-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-orange-500" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground">الأكثر تبرعاً</p>
                  <p className="text-xs font-bold">الزكاة</p>
                </div>
              </div>
              <div className="bg-card border border-border rounded-2xl p-4 flex flex-col items-center text-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Users className="w-4 h-4 text-purple-500" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground">متبرعين جدد</p>
                  <p className="text-xs font-bold">+12 اليوم</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
