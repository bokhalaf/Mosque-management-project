// ==============================
// Campaigns — CreateCampaignSection Component
// صفحة إنشاء حملة جديدة مطابقة لنظام التصميم وإرشادات الـ OpenAPI
// مع أزرار الإجراءات في الأعلى (PageHeader) والأسفل (Form Footer)
// ==============================

import React, { useState } from 'react';
import { PageHeader } from "../../app/components/PageHeader";
import {
  Upload, X, Info, Calendar, Target, Tag,
  Building2, CheckCircle2, Loader2, Sparkles
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

  const todayStr = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetAmount: '',
    startDate: todayStr,
    endDate: '',
    priority: 'medium',
    status: 'active',
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

  const handleRemoveImage = () => {
    setFormData(prev => ({
      ...prev,
      imageFile: null,
      imagePreview: null,
    }));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData.title.trim()) {
      showToast('يرجى إدخال عنوان الحملة', 'error');
      return;
    }
    if (!formData.targetAmount || Number(formData.targetAmount) <= 0) {
      showToast('يرجى تحديد المبلغ المستهدف للحملة', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      await addCampaign({
        title: formData.title.trim(),
        description: formData.description.trim(),
        targetAmount: Number(formData.targetAmount),
        startDate: formData.startDate || todayStr,
        endDate: formData.endDate || undefined,
        priority: formData.priority,
        status: formData.status,
        imageFile: formData.imageFile || undefined,
      });
      onBack();
    } catch (err: any) {
      console.error("Create Campaign Submit Error:", err);
      showToast(err.message || 'فشل إنشاء الحملة، يرجى التحقق من المدخلات', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const targetNum = Number(formData.targetAmount) || 0;

  return (
    <div className="flex flex-col min-h-screen bg-transparent font-['Cairo'] pb-12">
      {/* Page Header with Top Action Buttons */}
      <PageHeader
        title="إنشاء حملة تبرع جديدة"
        description="إضافة وتفعيل حملة تبرع تكافلية ومشاريع خيرية للمسجد."
        onBack={onBack}
        breadcrumbs={[
          { label: "إدارة المسجد" },
          { label: "إدارة التبرعات" },
          { label: "حملات التبرع" },
          { label: "إنشاء حملة", active: true }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-xl text-xs font-bold transition-colors"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl text-xs font-bold transition-all shadow-md shadow-primary/20 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري الإنشاء...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>إنشاء ونشر الحملة</span>
                </>
              )}
            </button>
          </div>
        }
      />

      <div className="px-4 md:px-8 pt-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Form Column (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-6 bg-primary rounded-full inline-block" />
                  <h3 className="text-base font-bold text-foreground">بيانات الحملة الخيرية</h3>
                </div>
                <span className="text-[11px] font-bold text-muted-foreground">الحقول المميزة بـ (*) مطلوبة</span>
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">عنوان الحملة *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="مثال: كسوة العيد للأيتام، ترميم الدور الثاني..."
                  className="w-full px-4 py-2.5 bg-muted border border-transparent focus:border-primary rounded-xl text-xs outline-none transition-all text-foreground placeholder:text-muted-foreground"
                  dir="rtl"
                />
              </div>

              {/* Target Amount & Priority Grid (الأولوية مكان الفئة) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-primary" />
                    المبلغ المستهدف (ل.س) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.targetAmount}
                    onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                    placeholder="مثال: 50000"
                    className="w-full px-4 py-2.5 bg-muted border border-transparent focus:border-primary rounded-xl text-xs outline-none transition-all text-foreground placeholder:text-muted-foreground"
                    dir="rtl"
                  />
                </div>

                {/* Priority — مكان الفئة */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-primary" />
                    أولوية الحملة *
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-4 py-2.5 bg-muted border border-transparent focus:border-primary rounded-xl text-xs outline-none transition-all text-foreground"
                    dir="rtl"
                  >
                    <option value="high">عاجلة / قصوى (High)</option>
                    <option value="medium">متوسطة الأولوية (Medium)</option>
                    <option value="low">عادية / منخفضة (Low)</option>
                  </select>
                </div>
              </div>

              {/* Start Date & End Date Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    تاريخ البدء *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-2.5 bg-muted border border-transparent focus:border-primary rounded-xl text-xs outline-none transition-all text-foreground"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                    تاريخ الانتهاء (اختياري)
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-4 py-2.5 bg-muted border border-transparent focus:border-primary rounded-xl text-xs outline-none transition-all text-foreground"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">وصف الحملة وتفاصيلها</label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="اشرح أهداف الحملة الخيرية وكيف سيتم توظيف مبالغ التبرعات لخدمة رواد المسجد..."
                  className="w-full px-4 py-2.5 bg-muted border border-transparent focus:border-primary rounded-xl text-xs outline-none transition-all text-foreground placeholder:text-muted-foreground resize-none"
                  dir="rtl"
                />
              </div>

              {/* Cover Image Upload */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">صورة غلاف الحملة</label>
                <div className="flex items-center gap-4">
                  {formData.imagePreview ? (
                    <div className="relative w-28 h-20 rounded-xl overflow-hidden border border-border shrink-0 bg-muted">
                      <img src={formData.imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full shadow-md"
                        title="إزالة الصورة"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : null}

                  <label className="flex-1 border-2 border-dashed border-border hover:border-primary rounded-2xl p-5 flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-muted/30 hover:bg-muted/60 transition-all text-center">
                    <Upload className="w-5 h-5 text-muted-foreground" />
                    <span className="text-xs font-bold text-foreground">
                      {formData.imageFile ? formData.imageFile.name : 'انقر لرفع صورة الغلاف'}
                    </span>
                    <span className="text-[10px] text-muted-foreground">PNG, JPG حتى 5MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Bottom Action Buttons (When user scrolls down) */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={onBack}
                  className="px-5 py-2.5 bg-muted hover:bg-muted/80 text-foreground rounded-xl text-xs font-bold transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl text-xs font-bold transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>جاري إنشاء الحملة...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>إنشاء ونشر الحملة</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Sidebar Area (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Important Guidelines Card */}
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
              <h4 className="font-bold text-xs text-foreground flex items-center gap-2">
                <Info className="w-4 h-4 text-emerald-600" />
                إرشادات إنشاء الحملات
              </h4>
              <ul className="space-y-3">
                {[
                  "تأكد من واقعية ومطابقة المبلغ المستهدف لاحتياج المشروع",
                  "تحديد الأولوية يساعد النظام في إبراز الحملات الأكثر إلحاحاً",
                  "إضافة صور واضحة ووصف دقيق يرفع من ثقة ومساهمة المتبرعين",
                  "يمكنك تعديل أو إيقاف الحملة مؤقتاً في أي وقت بعد إنشائها"
                ].map((text, i) => (
                  <li key={i} className="flex gap-2.5 text-xs text-muted-foreground leading-relaxed">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Live Card Preview Box */}
            <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-foreground flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  معاينة مظهر الكارد
                </h4>
                <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold">مباشر</span>
              </div>

              <div className="border border-border/80 rounded-xl overflow-hidden bg-muted/20 p-3 space-y-3">
                <div className="h-28 rounded-lg overflow-hidden bg-muted relative">
                  {formData.imagePreview ? (
                    <img src={formData.imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/40">
                      <Building2 className="w-8 h-8 mb-1" />
                      <span className="text-[10px]">غلاف الحملة</span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      نشطة
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="font-bold text-xs text-foreground line-clamp-1">
                    {formData.title || 'عنوان الحملة سيظهر هنا'}
                  </p>
                  <p className="text-[11px] text-muted-foreground line-clamp-1">
                    {formData.description || 'وصف مختصر للحملة الخيرية...'}
                  </p>
                </div>

                <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px] font-bold text-muted-foreground">
                  <span>الهدف: <strong className="text-foreground">{targetNum > 0 ? targetNum.toLocaleString('ar-EG') : '0'} ل.س</strong></span>
                  <span className="text-emerald-600 font-bold">
                    {formData.priority === 'high' ? 'عاجلة' : formData.priority === 'low' ? 'عادية' : 'متوسطة'}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
