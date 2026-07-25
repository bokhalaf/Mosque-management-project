import React, { useState } from 'react';
import { PageHeader } from "../../app/components/PageHeader";
import {
  Camera, X, Info, Calendar, Target, TrendingUp,
  ChevronLeft, Layout, Type, AlignRight, DollarSign,
  Save, Eye, ArrowRight, Plus, Loader2
} from "lucide-react";
import { useCampaigns } from "../hooks/useCampaigns";
import { useToast } from "../../app/components/ui/Toast";

interface CreateCampaignSectionProps {
  onBack: () => void;
}

export function CreateCampaignSection({ onBack }: CreateCampaignSectionProps) {
  const { addCampaign } = useCampaigns();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goal: '',
    endDate: '',
    category: 'بناء وتوسعة',
    imagePreview: null as string | null,
    imageFile: null as File | null,
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData(prev => ({
        ...prev,
        imageFile: file,
        imagePreview: event.target?.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.goal) {
      showToast('الرجاء تعبئة الحقول المطلوبة (عنوان الحملة، والمبلغ المستهدف)', 'error');
      return;
    }
    try {
      setIsSubmitting(true);
      await addCampaign({
        title: formData.title,
        description: formData.description,
        targetAmount: Number(formData.goal) || 0,
        imageFile: formData.imageFile || undefined,
        endDate: formData.endDate
      });
      showToast('✅ تم إنشاء الحملة بنجاح!', 'success');
      onBack();
    } catch (err: any) {
      console.error("Submit Error:", err);
      showToast('❌ حدث خطأ: ' + (err.message || 'تأكد من صحة البيانات المدخلة'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-transparent font-['Cairo'] pb-12">
      <PageHeader
        title="إنشاء حملة تبرع جديدة"
        description="أدخل تفاصيل الحملة المخطط لها بدقة لجمع التبرعات لمشاريع المسجد."
        onBack={onBack}
        breadcrumbs={[
          { label: "إدارة التبرعات" },
          { label: "حملات التبرع" },
          { label: "إنشاء حملة", active: true }
        ]}
        actions={
          <>
            <button className="px-6 py-3 bg-card border border-border text-foreground rounded-2xl font-bold hover:bg-muted transition-all active:scale-95">
              حفظ كمسودة
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-8 py-3 bg-primary text-primary-foreground rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/10 active:scale-95 disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" />جاري النشر...</>
              ) : 'نشر الحملة'}
            </button>
          </>
        }
      />

      <div className="px-4 md:px-8 py-4 grid grid-cols-1 xl:grid-cols-5 gap-8">
        {/* Form Area */}
        <div className="xl:col-span-3 space-y-8">
          <div className="bg-card border border-border rounded-[2rem] p-8 shadow-sm">
            <h3 className="text-xl font-bold text-foreground mb-8 flex items-center gap-3">
              <Type className="w-5 h-5 text-primary" />
              المعلومات الأساسية
            </h3>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">عنوان الحملة</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="مثال: حملة بناء توسعة الدور الثاني"
                  className="w-full px-5 py-4 bg-muted border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-right text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">الفئة</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-5 py-4 bg-muted border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-right appearance-none text-foreground"
                  >
                    <option>بناء وتوسعة</option>
                    <option>سقيا ماء</option>
                    <option>إطعام مسكين</option>
                    <option>كفالة أيتام</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">تاريخ الانتهاء</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-5 py-4 bg-muted border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-right text-foreground"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-foreground mb-2">وصف الحملة</label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="اشرح أهداف الحملة وكيف سيتم استخدام التبرعات..."
                  className="w-full px-5 py-4 bg-muted border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-right resize-none text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-[2rem] p-8 shadow-sm">
            <h3 className="text-xl font-bold text-foreground mb-8 flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-primary" />
              الأهداف المالية والوسائط
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-foreground mb-2">المبلغ المستهدف (ل.س)</label>
                  <div className="relative">
                    <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="number"
                      value={formData.goal}
                      onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                      placeholder="مثال: ٥٠,٠٠٠"
                      className="w-full px-5 py-4 bg-muted border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-right text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                </div>
                <div className="p-5 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                  <div className="flex gap-3">
                    <Info className="w-5 h-5 text-amber-500 shrink-0" />
                    <p className="text-xs text-amber-500 leading-relaxed font-medium">
                      سيتم عرض هذا المبلغ في شريط التقدم للجمهور. تأكد من واقعية الهدف لزيادة الثقة.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-foreground mb-2">صورة الغلاف</label>
                <div
                  className={`relative h-48 border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center transition-all ${formData.imagePreview ? 'border-primary bg-primary/10' : 'border-border bg-muted hover:border-primary/50 hover:bg-muted/80'
                    }`}
                >
                  {formData.imagePreview ? (
                    <>
                      <img src={formData.imagePreview} className="absolute inset-0 w-full h-full object-cover rounded-[2rem]" alt="Preview" />
                      <button
                        onClick={() => setFormData({ ...formData, imagePreview: null, imageFile: null })}
                        className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full shadow-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center gap-3">
                      <div className="w-12 h-12 bg-background rounded-full flex items-center justify-center shadow-sm border border-border">
                        <Camera className="w-6 h-6 text-primary" />
                      </div>
                      <span className="text-xs font-bold text-muted-foreground">انقر لرفع صورة الحملة</span>
                      <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                    </label>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Area */}
        <div className="xl:col-span-2 space-y-6">
          <div className="sticky top-28">
            <div className="flex items-center justify-between mb-4 px-4">
              <h3 className="text-lg font-black text-foreground flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary" />
                معاينة مباشرة
              </h3>
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-[10px] font-black">نسخة العرض</span>
            </div>

            <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-xl shadow-black/5">
              {/* Image Preview */}
              <div className="h-64 bg-muted relative">
                {formData.imagePreview ? (
                  <img src={formData.imagePreview} className="w-full h-full object-cover" alt="Campaign" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                    <Camera className="w-12 h-12" />
                  </div>
                )}
                <div className="absolute top-4 right-4 px-4 py-1.5 bg-background/90 backdrop-blur-md rounded-full text-[10px] font-black text-foreground">
                  {formData.category}
                </div>
              </div>

              {/* Content Preview */}
              <div className="p-8 space-y-6">
                <div>
                  <h4 className="text-2xl font-black text-foreground leading-tight">
                    {formData.title || 'عنوان الحملة يظهر هنا'}
                  </h4>
                  <p className="text-sm text-muted-foreground mt-3 line-clamp-3 leading-relaxed">
                    {formData.description || 'وصف الحملة وتفاصيلها ستظهر في هذا المكان عند كتابتها في النموذج...'}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-foreground">المبلغ المحقق: ٠ ل.س</span>
                    <span className="text-sm font-bold text-muted-foreground">من {formData.goal || '٠'} ل.س</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[15%] rounded-full shadow-[0_0_10px_rgba(var(--primary),0.3)]"></div>
                  </div>
                  <p className="text-[10px] text-muted-foreground font-bold">باقي على انتهاء الحملة: ٢٤ يوم</p>
                </div>

                <button className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-black text-sm shadow-lg shadow-primary/20 flex items-center justify-center gap-2 group hover:bg-primary/90 transition-all">
                  تبرع الآن للحملة
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                </button>
              </div>
            </div>

            {/* Tips Card */}
            <div className="mt-6 p-6 bg-primary text-primary-foreground rounded-[2rem]">
              <h5 className="font-black text-sm mb-3">نصيحة للمدير 💡</h5>
              <p className="text-[11px] text-primary-foreground/80 leading-loose">
                الحملات التي تحتوي على وصف دقيق وصور عالية الجودة تحقق نتائج تبرع أعلى بنسبة ٤٠٪ مقارنة بالحملات الأخرى.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
